const Feature = require('./Base/Feature');
const Timbot = require('../Core/Timbot');
const ApiServer = require('../Admin/ApiServer');
const _package = require('../../package');

class TimbotInfo extends Feature {
    constructor() {
        super();

        this._handleApiUserConnected = this._handleApiUserConnected.bind(this);
        this._handleApiFetchServerList = this._handleApiFetchServerList.bind(this);
        this._handleApiLeaveServer = this._handleApiLeaveServer.bind(this);
    }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @inheritDoc
     */
    enable() {
        Timbot.api.registerApi(ApiServer.OP_ADMIN_CONNECT_EVENT, this._handleApiUserConnected);
        Timbot.api.registerApi(TimbotInfo.OP_FETCH_SERVER_LIST, this._handleApiFetchServerList);
        Timbot.api.registerApi(TimbotInfo.OP_LEAVE_SERVER, this._handleApiLeaveServer);
    }

    /**
     * @inheritDoc
     */
    disable() {
        Timbot.api.unregisterApi(ApiServer.OP_ADMIN_CONNECT_EVENT, this._handleApiUserConnected);
        Timbot.api.unregisterApi(TimbotInfo.OP_FETCH_SERVER_LIST, this._handleApiFetchServerList);
        Timbot.api.unregisterApi(TimbotInfo.OP_LEAVE_SERVER, this._handleApiLeaveServer);
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

    _handleApiUserConnected(client) {
        client.sendAsJson(this._generatePayload());
    }

    _handleApiFetchServerList(client) {
        let szList = [];
        let discordClient = Timbot.discord.client;

        if (discordClient && discordClient.guilds) {
            discordClient.guilds.array().forEach((guild) => {
                szList.push({
                    id: guild.id,
                    name: guild.name,
                    icon: guild.iconURL,
                    joined: guild.joinedTimestamp,
                    members: guild.memberCount,
                    owner_name: guild.owner.user.username
                });
            });
        }

        client.sendAsJson({
            op: TimbotInfo.OP_FETCH_SERVER_LIST,
            servers: szList
        });
    }

    _handleApiLeaveServer(client, data) {
        let serverId = data.id;
        let discordClient = Timbot.discord.client;

        if (discordClient) {
            let guild = discordClient.guilds.get(serverId);

            if (guild) {
                guild.leave()
                    .then(() => {
                        Timbot.log.i(_("[Discord] Left server {0} [requested from admin]", serverId));
                        this._handleApiFetchServerList(client);
                    });
            }
        }
    }

    // -----------------------------------------------------------------------------------------------------------------

    broadcastAdminInfo() {
        Timbot.api.broadcast(this._generatePayload(), true, false);
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

        return {
            op: "info",
            version: _package.version,
            discord: discord
        };
    }
}

TimbotInfo.OP_FETCH_SERVER_LIST = "list_servers";
TimbotInfo.OP_LEAVE_SERVER = "leave_server";

module.exports = TimbotInfo;
