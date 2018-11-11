/**
 * Timbot core.
 */
class Timbot {
    /**
     * Initializes Timbot and starts all modules.
     */
    static start() {
        // Init config
        let configOk = this._loadConfig();

        // Init locale & logging
        this._initLang();
        this._initLogging();

        // Config result check
        if (!configOk) {
            Timbot.log.e(_("Configuration file could not be loaded ({0}).", process.env.NODE_ENV));
            process.exit(Timbot.EXIT_CODE_STARTUP_CONFIG_ERROR);
            return;
        } else {
            Timbot.log.i(_("Configuration loaded successfully ({0}).", process.env.NODE_ENV));
        }

        // Init Discord core
        this._initDiscord();

        // Startup complete
        Timbot.log.i(_("Timbot has started successfully."));
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
            level: 'info',
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
     * Init step: Connect to Discord and log in as bot.
     *
     * @private
     */
    static _initDiscord() {
        const Discord = require('../Discord/Discord');

        this.discord = new Discord(this.config);
        this.discord.start();
    }
}

// Reserved exit codes (Unix)
Timbot.EXIT_CODE_OK = 0;
Timbot.EXIT_CODE_ERROR_GENERIC = 1;

// User defined exit codes (range 64 - 113 per http://www.tldp.org/LDP/abs/html/exitcodes.html)
Timbot.EXIT_CODE_STARTUP_CONFIG_ERROR = 64;

module.exports = Timbot;
