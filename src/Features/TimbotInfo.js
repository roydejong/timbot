const Feature = require('./Base/Feature');
const Timbot = require('../Core/Timbot');
const ApiServer = require('../Admin/ApiServer');
const _package = require('../../package');

class TimbotInfo extends Feature {
    constructor() {
        super();

        this._handleApiUserConnected = this._handleApiUserConnected.bind(this);
    }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @inheritDoc
     */
    enable() {
        Timbot.api.registerApi(ApiServer.OP_ADMIN_CONNECT_EVENT, this._handleApiUserConnected);
    }

    /**
     * @inheritDoc
     */
    disable() {
        Timbot.api.unregisterApi(ApiServer.OP_ADMIN_CONNECT_EVENT, this._handleApiUserConnected);
    }

    /**
     * @inheritDoc
     */
    handleEvent(eventName, data) {
        if (eventName === Feature.EVENT_DISCORD_READY || eventName === Feature.EVENT_DISCORD_DISCONNECTED) {
            // Discord connected or disconnected, send this update through to the admin panel
            this.broadcastAdminInfo();
        }
    }

    // -----------------------------------------------------------------------------------------------------------------

    _handleApiUserConnected(ws) {
        try {
            ws.send(this._generatePayload());
        } catch (e) { }
    }

    // -----------------------------------------------------------------------------------------------------------------

    broadcastAdminInfo() {
        Timbot.api.broadcast(this._generatePayload());
    }

    // -----------------------------------------------------------------------------------------------------------------

    _generatePayload() {
        let discord = {
            connected: false
        };

        if (Timbot.discord.client && Timbot.discord.client.user) {
            let dUser = Timbot.discord.client.user;

            discord = {
                connected: true,
                tag: dUser.tag,
                username: dUser.username,
                id: dUser.id,
                discriminator: dUser.discriminator,
                avatar: dUser.avatarURL
            };
        }

        return JSON.stringify({
            op: "info",
            version: _package.version,
            discord: discord
        });
    }
}

module.exports = TimbotInfo;
