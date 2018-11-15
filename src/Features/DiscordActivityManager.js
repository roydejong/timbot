const Timbot = require('../Core/Timbot');
const Features = require('../Core/Features');
const ApiServer = require('../Admin/ApiServer');

/**
 * Manages the Discord bot's current activity / status.
 */
class DiscordActivityManager {
    constructor() {
        this._currentType = DiscordActivityManager.ACTIVITY_AUTO;
        this._currentPresence = "online";
        this._currentText = "";
        this._currentUrl = "";
    }

    enable() {
        // Admin API: Receive activity change requests
        Timbot.api.registerApi(DiscordActivityManager.API_OP_ACTIVITY_UPDATE,
            this._handleApiActivityUpdate.bind(this));

        // Admin API: Send current status when client connects
        Timbot.api.registerApi(ApiServer.OP_ADMIN_CONNECT_EVENT,
            this._handleApiUserConnected.bind(this));

        // Load last state from database
        this._dbLoadState();

        // Period update timer (discord sometimes doesn't show our status so be pushy about it)
        this.applyInterval = setInterval(() => {
            this.applyActivity();
        }, 60 * 1000);
    }

    disable() {
        if (this.applyInterval) {
            clearInterval(this.applyInterval);
            this.applyInterval = null;
        }
    }

    handleEvent(eventName, data) {
        if (eventName === Features.EVENT_DISCORD_READY) {
            this.applyActivity(true);
        }
    }

    /**
     * Handles requests from admin API to manually override current activity.
     *
     * @param ws
     * @param data
     */
    _handleApiActivityUpdate(ws, data) {
        let type = data.type || DiscordActivityManager.ACTIVITY_AUTO;
        let text = data.text || "";
        let url = data.url || "";
        let presence = data.presence || "online";

        if (type !== DiscordActivityManager.ACTIVITY_STREAMING) {
            url = null;
        }

        this._currentType = type;
        this._currentText = text;
        this._currentUrl = url;
        this._currentPresence = presence;

        this._dbWriteState();
        this.applyActivity();
    }

    /**
     * Saves the activity state / settings to the database.
     *
     * @private
     */
    _dbWriteState() {
        try {
            Timbot.settings.set("presence", this._currentPresence, false);
            Timbot.settings.set("activity_type", this._currentType, false);
            Timbot.settings.set("activity_text", this._currentText, false);
            Timbot.settings.set("activity_url", this._currentUrl, false);
            Timbot.settings.save();
        } catch (e) {
            Timbot.log.e(_("[Activity] Could not write state to database: {0}", e.message));
        }
    }

    /**
     * Loads the Discord last activity state / settings from the database.
     *
     * @private
     */
    _dbLoadState() {
        try {
            this._currentPresence = Timbot.settings.get("presence", "online");
            this._currentType = Timbot.settings.get("activity_type", DiscordActivityManager.ACTIVITY_PLAYING);
            this._currentText = Timbot.settings.get("activity_text", "");
            this._currentUrl = Timbot.settings.get("activity_url", "");

            this.applyActivity();
        } catch (e) {
            Timbot.log.e(_("[Activity] Could not load state from database: {0}", e.message));
        }
    }

    /**
     * Handles a new user connecting to the admin panel; sends the current activity info.
     *
     * @param ws
     * @param data
     * @private
     */
    _handleApiUserConnected(ws, data) {
        try {
            ws.send(this._generateStatusMessage());
        } catch (e) { }
    }

    /**
     * Generates a status update message for the admin API.
     *
     * @returns {object}
     * @private
     */
    _generateStatusMessage() {
        return JSON.stringify({
            "op": DiscordActivityManager.API_OP_ACTIVITY_UPDATE,
            "type": this._currentType,
            "presence": this._currentPresence,
            "text": this._currentText,
            "url": this._currentUrl
        });
    }

    /**
     * Applies the current activity to the Discord bot.
     */
    applyActivity(performReset) {
        // Q: What the fuck is going on with this function?
        // A: For some reason Discord won't set our activity sometimes, especially after login. Trying to circumvent it.
        try {
            if (Timbot.discord.client && Timbot.discord.client.user) {

                if (performReset) {
                    // Clear presence
                    Timbot.discord.client.user.setStatus("online");
                    Timbot.discord.client.user.setAFK(false);

                    // Clear activity, then apply actual status after a few seconds
                    Timbot.discord.client.user.setActivity(`Timbot v${Timbot.version} 👋`, { type: DiscordActivityManager.ACTIVITY_WATCHING })
                        .then(() => {
                            Timbot.log.d(_("[Activity] Cleared Discord activity"));

                            setTimeout(() => {
                                this.applyActivity(false);
                            }, DiscordActivityManager.RESET_DELAY_MS);
                        });
                } else {
                    // Update presence, then activity
                    Timbot.discord.client.user.setAFK(this._currentPresence === "idle");
                    Timbot.discord.client.user.setStatus(this._currentPresence)
                        .then(() => {
                            Timbot.discord.client.user.setActivity(this._currentText, {
                                type: (this._currentType === DiscordActivityManager.ACTIVITY_AUTO ?
                                    DiscordActivityManager.ACTIVITY_PLAYING : this._currentType) || null,
                                url: this._currentUrl || null
                            });

                            Timbot.log.d(_("[Activity] Updated discord activity: {2} {0} {1}", this._currentType, this._currentText,
                                this._currentPresence));
                        });
                }
            }
        } catch (e) {
            Timbot.log.w(_("[Activity] Failed to update current activity: {0}", e.message));
        }

        this.broadcastActivityToAdmin();
    }

    /**
     * Broadcasts the current activity configuration to any admin API clients.
     */
    broadcastActivityToAdmin() {
        Timbot.api.broadcast(this._generateStatusMessage());
    }
}

DiscordActivityManager.RESET_DELAY_MS = 3000;

DiscordActivityManager.API_OP_ACTIVITY_UPDATE = "activity";

DiscordActivityManager.ACTIVITY_AUTO = "AUTO";
DiscordActivityManager.ACTIVITY_PLAYING = "PLAYING";
DiscordActivityManager.ACTIVITY_STREAMING = "STREAMING";
DiscordActivityManager.ACTIVITY_LISTENING = "LISTENING";
DiscordActivityManager.ACTIVITY_WATCHING = "WATCHING";

DiscordActivityManager.ACTIVITIES = { };
DiscordActivityManager.ACTIVITIES[DiscordActivityManager.ACTIVITY_AUTO] = _("Automatic");
DiscordActivityManager.ACTIVITIES[DiscordActivityManager.ACTIVITY_PLAYING] = _("Playing");
DiscordActivityManager.ACTIVITIES[DiscordActivityManager.ACTIVITY_STREAMING] = _("Streaming");
DiscordActivityManager.ACTIVITIES[DiscordActivityManager.ACTIVITY_LISTENING] = _("Listening");
DiscordActivityManager.ACTIVITIES[DiscordActivityManager.ACTIVITY_WATCHING] = _("Watching");

module.exports = DiscordActivityManager;
