const Timbot = require('../Core/Timbot');
const DiscordJs = require('discord.js');

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

        if (!this.config.has("discord.token")) {
            throw new Error("No `discord.token` has been configured. Cannot log in to Discord.");
        }
    }

    /**
     * Starts the Discord bot, or restarts it if necessary.
     */
    start() {
        if (this.client) {
            try {
                this.client.destroy();
            } catch (e) { }

            this.client = null;
        }

        this.client = new DiscordJs.Client();
        this._bindClientEvents();
        this.client.login(this.config.discord.token);
    }

    /**
     * Init step: Bind handlers for various Discord events.
     *
     * @private
     */
    _bindClientEvents() {
        // Event: Logged in to Discord, bot is online.
        this.client.on('ready', () => {
            Timbot.log.i(_("Logged in to Discord as {0} ({1} servers).", this.client.user.tag, this.client.guilds.size));
        });

        // Event: Error, we have been disconnected and the client will no longer attempt to fix it.
        this.client.on('disconnect', () => {
            Timbot.log.w(_("Disconnected from Discord. Retrying connection..."));
            this.start();
        });

        // Event: Connection error
        this.client.on('error', (error) => {
            Timbot.log.e(_("Discord connection error occurred: {0}. Retrying connection...", error));
            this.start();
        });

        // Event: Incoming message
        this.client.on('message', (message) => {
            console.log(message.cleanContent);
        });
    }
}

module.exports = Discord;
