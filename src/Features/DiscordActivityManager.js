const Timbot = require('../Core/Timbot');
const ApiServer = require('../Admin/ApiServer');

/**
 * Manages the Discord bot's current activity / status.
 */
class DiscordActivityManager {
    constructor() {
        this._currentType = DiscordActivityManager.ACTIVITY_PLAYING;
        this._currentText = "truth or dare";
        this._currentUrl = "";
    }

    enable() {
        // Admin API: Receive activity change requests
        Timbot.api.registerApi(DiscordActivityManager.API_OP_ACTIVITY_UPDATE,
            this.handleApiActivityUpdate.bind(this));

        // Admin API: Send current status when client connects
        Timbot.api.registerApi(ApiServer.OP_ADMIN_CONNECT_EVENT,
            this.handleApiUserConnected.bind(this));

        // Apply default activity
        this.applyActivity();
    }

    /**
     * Handles requests from admin API to manually override current activity.
     *
     * @param ws
     * @param data
     */
    handleApiActivityUpdate(ws, data) {
        console.log('handle update');

        let type = data.type || DiscordActivityManager.ACTIVITY_AUTO;
        let text = data.text || "";
        let url = data.url || "";

        if (type !== DiscordActivityManager.ACTIVITY_STREAMING) {
            url = null;
        }

        this._currentType = type;
        this._currentText = text;
        this._currentUrl = url;

        this.applyActivity();
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
            "text": this._currentText,
            "url": this._currentText
        });
    }

    /**
     * Applies the current activity to the Discord bot.
     */
    applyActivity() {
        try {
            if (Timbot.discord.client && Timbot.discord.client.user) {
                Timbot.discord.client.user.setActivity(this._currentText, {
                    type: this._currentType,
                    url: this._currentUrl
                });
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
