const config = require('./config.json');

const Discord = require('discord.js');
const client = new Discord.Client();
const TwitchMonitor = require("./twitch-monitor");

console.log('Timbot is starting.');

let targetChannels = [];

let syncServerList = (logMembership) => {
    let nextTargetChannels = [];

    client.guilds.forEach((guild) => {
        let targetChannel = guild.channels.find("name", config.discord_announce_channel);

        if (!targetChannel) {
            console.warn('[Discord]', 'Configuration problem /!\\', `Guild ${guild.name} does not have a #${config.discord_announce_channel} channel!`);
        } else {
            let permissions = targetChannel.permissionsFor(guild.me);

            if (logMembership) {
                console.log('[Discord]', ' --> ', `Member of server ${guild.name}, target channel is #${targetChannel.name}`);
            }

            if (!permissions.has("SEND_MESSAGES")) {
                console.warn('[Discord]', 'Permission problem /!\\', `I do not have SEND_MESSAGES permission on channel #${targetChannel.name} on ${guild.name}: announcement sends will fail.`);
            }

            nextTargetChannels.push(targetChannel);
        }
    });

    console.log('[Discord]', `Discovered ${nextTargetChannels.length} channels to announce to.`);
    targetChannels = nextTargetChannels;
};

client.on('ready', () => {
    console.log('[Discord]', `Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);

    // Init list of connected servers, and determine which channels we are announcing to
    syncServerList(true);

    // Keep our activity in the user list in sync
    StreamActivity.init(client);

    // Begin Twitch API polling
    TwitchMonitor.start();
});

client.on("guildCreate", guild => {
    console.log(`[Discord]`, `Joined new server: ${guild.name}`);

    syncServerList(false);
});

client.on("guildDelete", guild => {
    console.log(`[Discord]`, `Removed from a server: ${guild.name}`);

    syncServerList(false);
});

client.on('message', message => {
    if (message.content === '!timbot') {
        message.reply(':timMrBones:');
    }
});

console.log('[Discord]', 'Logging in...');
client.login(config.bot_token);

// Activity updater
class StreamActivity {
    /**
     * Registers a channel that has come online, and updates the user activity.
     */
    static setChannelOnline(channel) {
        this.onlineChannels[channel.name] = channel;

        this.updateActivity();
    }

    /**
     * Marks a channel has having gone offline, and updates the user activity if needed.
     */
    static setChannelOffline(channel) {
        delete this.onlineChannels[channel.name];

        this.updateActivity();
    }

    /**
     * Fetches the channel that went online most recently, and is still currently online.
     */
    static getDisplayChannel() {
        let lastChannel = null;

        for (let channelName in this.onlineChannels) {
            if (typeof channelName !== "undefined" && channelName) {
                lastChannel = this.onlineChannels[channelName];
            }
        }

        return lastChannel;
    }

    /**
     * Updates the user activity on Discord.
     * Either clears the activity if no channels are online, or sets it to "watching" if a stream is up.
     */
    static updateActivity() {
        let displayChannel = this.getDisplayChannel();

        if (displayChannel) {
            this.discordClient.user.setActivity(displayChannel.display_name, {
                "url": displayChannel.url,
                "type": "STREAMING"
            });

            console.log('[StreamActivity]', `Update current activity: watching ${displayChannel.display_name}.`);
        } else {
            console.log('[StreamActivity]', 'Cleared current activity.');

            this.discordClient.user.setActivity(null);
        }
    }

    static init(discordClient) {
        this.discordClient = discordClient;
        this.onlineChannels = { };

        this.updateActivity();

        // Continue to update current stream activity every 5 minutes or so
        // We need to do this b/c Discord sometimes refuses to update for some reason
        // ...maybe this will help, hopefully
        setInterval(this.updateActivity.bind(this), 5 * 60 * 1000);
    }
}

// Message helper
const formatLiveMessage = function (channelData, streamData) {
    let formattedMessage = `🔴 **${channelData.display_name} is live on Twitch**.` + "\r\n";
    formattedMessage += `${channelData.url}` + "\r\n";
    formattedMessage += `\`${channelData.status}\``;

    return formattedMessage;
};

// Listen to Twitch monitor events
TwitchMonitor.onChannelLiveUpdate((channelData) => {
    // Update activity
    StreamActivity.setChannelOnline(channelData);

    // Broadcast to all target channels
    let msgFormatted = formatLiveMessage(channelData);
    let anySent = false;

    for (let i = 0; i < targetChannels.length; i++) {
        let targetChannel = targetChannels[i];

        if (targetChannel) {
            try {
                targetChannel.send(msgFormatted);
                anySent = true;
                console.log('[Discord]', `Sent announce msg to #${targetChannel.name} on ${targetChannel.guild.name}`);
            } catch (e) {
                console.warn('[Discord]', 'Message send problem:', e);
            }
        }
    }

    return anySent;
});

TwitchMonitor.onChannelOffline((channelData) => {
    // Update activity
    StreamActivity.setChannelOffline(channelData);
});