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
            this.handleApiActivityUpdate.bind(this));

        // Admin API: Send current status when client connects
        Timbot.api.registerApi(ApiServer.OP_ADMIN_CONNECT_EVENT,
            this.handleApiUserConnected.bind(this));

        // Load last state from database
        this.dbLoadState();
    }

    handleEvent(eventName, data) {
        if (eventName === Features.EVENT_DISCORD_READY) {
            this.applyActivity();
        }
    }

    /**
     * Handles requests from admin API to manually override current activity.
     *
     * @param ws
     * @param data
     */
    handleApiActivityUpdate(ws, data) {
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

        this.dbWriteState();
        this.applyActivity();
    }

    dbWriteState() {
        try {
            Timbot.db.connection.prepare("UPDATE `settings` SET `value` = ? WHERE `key` = ? LIMIT 1;")
                .run(this._currentPresence, "presence");

            Timbot.db.connection.prepare("UPDATE `settings` SET `value` = ? WHERE `key` = ? LIMIT 1;")
                .run(this._currentType, "activity_type");

            Timbot.db.connection.prepare("UPDATE `settings` SET `value` = ? WHERE `key` = ? LIMIT 1;")
                .run(this._currentText, "activity_text");

            Timbot.db.connection.prepare("UPDATE `settings` SET `value` = ? WHERE `key` = ? LIMIT 1;")
                .run(this._currentUrl, "activity_url");

            Timbot.log.d(_("[Activity] tried 2 rite"));
        } catch (e) {
            Timbot.log.e(_("[Activity] Could not write state to database: {0}", e.message));
        }
    }

    dbLoadState() {
        try {
            this._currentPresence = (Timbot.db.connection.prepare("SELECT `value` FROM `settings` WHERE `key` = ?")
                .get("presence").value) || "online";
            this._currentType = (Timbot.db.connection.prepare("SELECT `value` FROM `settings` WHERE `key` = ?")
                .get("activity_type").value) || "online";
            this._currentText = (Timbot.db.connection.prepare("SELECT `value` FROM `settings` WHERE `key` = ?")
                .get("activity_text").value) || "";
            this._currentUrl = (Timbot.db.connection.prepare("SELECT `value` FROM `settings` WHERE `key` = ?")
                .get("activity_url").value) || "";

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
     */
    handleApiUserConnected(ws, data) {
        try {
            ws.send(this.generateStatusMessage());
        } catch (e) { }
    }

    /**
     * Generates a status update message for the admin API.
     *
     * @returns {object}
     */
    generateStatusMessage() {
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
    applyActivity() {
        try {
            if (Timbot.discord.client && Timbot.discord.client.user) {
                Timbot.discord.client.user.setStatus(this._currentPresence);
                Timbot.discord.client.user.setAFK(this._currentPresence === "idle");
                Timbot.discord.client.user.setActivity(this._currentText, {
                    type: (this._currentType === DiscordActivityManager.ACTIVITY_AUTO ?
                        DiscordActivityManager.ACTIVITY_PLAYING : this._currentType),
                    url: this._currentUrl
                });

                Timbot.log.d(_("[Activity] Updated discord activity: {2} {0} {1}", this._currentType, this._currentText,
                    this._currentPresence));
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
        Timbot.api.broadcast(this.generateStatusMessage());
    }
}

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
