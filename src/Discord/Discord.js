const DiscordJs = require('discord.js');
const Timbot = require('../Core/Timbot');
const Features = require('../Core/Features');

/**
 * Timbot Discord Bot Manager
 */
class Discord {
    /**
     * Initializes the Discord bot manager.
     *
     * @param {config} config
     */
    constructor(config) {
        this.config = config;
        this.timeoutSecs = 3;

        if (!this.config.has("discord.token")) {
            throw new Error("No `discord.token` has been configured. Cannot log in to Discord.");
        }
    }

    /**
     * Starts the Discord bot, or restarts it if necessary.
     */
    start() {
        this.stop(true);
        this.isUp = true;

        this.client = new DiscordJs.Client();
        this._bindClientEvents();

        this.client.login(this.config.discord.token)
            .catch((err) => {
                Timbot.log.e(_("Error occurred during Discord login: {0}.", err || "Unknown error"));
                this._scheduleRetry();
            });
    }

    /**
     * Shuts down the Discord connection gracefully, if needed.
     */
    stop(quietMode) {
        this.isUp = false;

        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = null;
        }

        if (this.client) {
            try {
                this.client.destroy();

                if (!quietMode) {
                    Timbot.log.d(_("[Discord] Connection closed / logged out."));
                }
            } catch (e) { }

            this.client = null;
        }
    }

    /**
     * Helper function to schedule the next connection retry attempt, in case of failure.
     *
     * @private
     */
    _scheduleRetry() {
        if (!this.isUp) {
            return false;
        }

        Timbot.log.w(_("Retrying Discord connection in {0} seconds...", this.timeoutSecs));

        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = null;
        }

        this.retryTimeout = setTimeout(() => {
            this.start();
        }, this.timeoutSecs * 1000);

        if (this.timeoutSecs >= Discord.RETRY_TIMEOUT_MAX_SECS) {
            this.timeoutSecs = Discord.RETRY_TIMEOUT_MAX_SECS;
        } else {
            this.timeoutSecs *= 1.5;
            this.timeoutSecs = Math.round(this.timeoutSecs);
        }

        return true;
    }

    /**
     * Init step: Bind handlers for various Discord events.
     *
     * @private
     */
    _bindClientEvents() {
        // Event: Logged in to Discord, bot is online.
        this.client.on('ready', () => {
            if (!this.isUp) return;

            this.timeoutSecs = 30;

            Timbot.log.i(_("Logged in to Discord as {0} (member of {1} server(s)).", this.client.user.tag, this.client.guilds.size));

            Timbot.features.emitEvent(Features.EVENT_DISCORD_READY, {
                client: this.client,
                user: this.client.user
            });
        });

        // Event: Error, we have been disconnected and the client will no longer attempt to fix it.
        this.client.on('disconnect', () => {
            if (!this.isUp) return;

            Timbot.log.e(_("Discord connection failed."));

            Timbot.features.emitEvent(Features.EVENT_DISCORD_DISCONNECTED, {
                client: this.client,
                user: this.client.user
            });

            this._scheduleRetry();
        });

        // Event: Connection error
        this.client.on('error', (error) => {
            if (!this.isUp) return;

            Timbot.log.e(_("Discord connection error: {0}.", error));
            this._scheduleRetry();
        });

        // Event: Incoming message
        this.client.on('message', (message) => {
            if (!this.isUp) return;

            console.log(message.cleanContent);
        });
    }
}

Discord.RETRY_TIMEOUT_MAX_SECS = 300;

module.exports = Discord;
