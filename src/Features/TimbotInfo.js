const Timbot = require('../Core/Timbot');
const Features = require('../Core/Features');
const ApiServer = require('../Admin/ApiServer');
const _package = require('../../package');

class TimbotInfo {
    enable() {
        Timbot.api.registerApi(ApiServer.OP_ADMIN_CONNECT_EVENT, this.handleApiUserConnected.bind(this));
    }

    handleApiUserConnected(ws) {
        try {
            ws.send(this.generatePayload());
        } catch (e) { }
    }

    handleEvent(eventName) {
        if (eventName === Features.EVENT_DISCORD_READY) {
            this.broadcastAdminInfo();
        }
    }

    generatePayload() {
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

    broadcastAdminInfo() {
        Timbot.api.broadcast(this.generatePayload());
    }
}

module.exports = TimbotInfo;
