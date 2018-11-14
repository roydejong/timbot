/**
 * Timbot core.
 */
class Timbot {
    /**
     * Initializes Timbot and starts all modules.
     */
    static start() {
        // Set version
        this.package = require('../../package.json');
        this.version = this.package.version;

        // Init config
        let configOk = this._loadConfig();

        // Init locale & logging
        this._initLang();
        this._initLogging();

        // Config result check
        if (!configOk) {
            Timbot.log.e(_("Configuration file could not be loaded ({0}).", process.env.NODE_ENV || "default"));
            process.exit(Timbot.EXIT_CODE_STARTUP_CONFIG_ERROR);
            return;
        } else {
            Timbot.log.i(_("Configuration loaded successfully ({0}).", process.env.NODE_ENV || "default"));
        }

        // Init signal handlers
        this._bindSignals();

        // Start admin server
        this._initAdmin();

        // Init database
        this._initDb();

        // Init Discord core
        try {
            this._initDiscord();
        } catch (e) {
            Timbot.log.e(_("Startup failure: There seems a problem with the Discord integration [{0}].",
                e.message || "Unknown error"));

            process.exit(Timbot.EXIT_CODE_STARTUP_DISCORD_ERROR);
            return;
        }

        // Init Features
        this._initFeatures();

        // Startup complete
        Timbot.log.i(_("✔️ Timbot has started successfully. Ready for action."));
    }

    /**
     * Attempt graceful shutdown.
     */
    static stop() {
        // Our goal: shut down everything and anything that's (potentially) keeping our process up
        Timbot.log.w(_("Shutting down..."));

        setTimeout(() => {
            Timbot.log.i(_("Bye!"));
            process.exit(0);
        }, Timbot.SHUT_DOWN_TIME_MS);

        // Disconnect from Discord to stop the bot and its events
        if (this.discord) {
            this.discord.stop();
        }

        // Shut down the admin API (express server)
        if (this.api) {
            this.api.stop();
        }

        // Disable all features
        if (this.features) {
            this.features.shutdown();
        }
    }

    /**
     * Init step: Load and verify configuration.
     *
     * @returns {boolean}
     * @private
     */
    static _loadConfig() {
        process.env.SUPPRESS_NO_CONFIG_WARNING = "1";
        process.env.NODE_CONFIG_STRICT_MODE = "1";

        try {
            this.config = require('config');
            return true;
        } catch (e) {
        }

        return false;
    }

    /**
     * Init step: Set the locale from config / load language texts.
     *
     * @private
     */
    static _initLang() {
        const Lang = require('./Intl/Lang');

        this.lang = new Lang();
        this.lang.bind();
    }

    /**
     * Init step: Configure logging formatting and outputs based on config.
     *
     * @private
     */
    static _initLogging() {
        const winston = require('winston');

        const consoleFormat = winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.align(),
            winston.format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`),
        );

        this._logger = winston.createLogger({
            level: 'debug',
            transports: [
                new winston.transports.Console({
                    format: consoleFormat
                })
            ]
        });

        const LogHelper = require('./Helper/LogHelper');

        this.log = new LogHelper(this._logger);
        this.log.i(_("Timbot is starting."));
    }

    /**
     * Init step: Bind process signal handlers (e.g. for CTRL+C / SIGTERM graceful shutdown)
     *
     * @private
     */
    static _bindSignals() {
        let handleShutdownSignal = (signal) => {
            try {
                Timbot.log.w(_("INTERRUPTED: Process signal received: {0}", signal));
                this.stop();
            } catch (e) {
                try {
                    Timbot.log.e(_("Error during shutdown: {0}", signal));
                    process.exit(Timbot.EXIT_CODE_ERROR_GENERIC);
                    return false;
                } catch (e2) { }
            }
        };

        // Register for all known shutdown/kill signals
        let shutdownSignals = ["SIGTERM", "SIGINT"];

        shutdownSignals.forEach((signalName) => {
            process.on(signalName, handleShutdownSignal.bind(this, signalName));
        });
    }

    /**
     * Init step: Initialize Admin API server / management web interface.
     *
     * @private
     */
    static _initAdmin() {
        const ApiServer = require('../Admin/ApiServer');

        if (this.config.admin.enabled) {
            this.api = new ApiServer(this.config);
            this.api.start();
        }
    }

    /**
     * Init step: Initialize sqlite database.
     *
     * @private
     */
    static _initDb() {
        const Db = require('../Data/Db');

        this.db = new Db(this.config);
        this.db.init();
    }

    /**
     * Init step: Connect to Discord and log in as bot.
     *
     * @private
     */
    static _initDiscord() {
        const Discord = require('../Discord/Discord');

        this.discord = new Discord(this.config);
        this.discord.start();
    }

    /**
     * Init step: Load features/plugins.
     *
     * @private
     */
    static _initFeatures() {
        const Features = require('./Features');

        this.features = new Features();
        this.features.start();
    }
}

Timbot.SHUT_DOWN_TIME_MS = 1000;

// Reserved exit codes (Unix)
Timbot.EXIT_CODE_OK = 0;
Timbot.EXIT_CODE_ERROR_GENERIC = 1;

// User defined exit codes (range 64 - 113 per http://www.tldp.org/LDP/abs/html/exitcodes.html)
Timbot.EXIT_CODE_STARTUP_CONFIG_ERROR = 64;
Timbot.EXIT_CODE_STARTUP_DISCORD_ERROR = 65;

module.exports = Timbot;
