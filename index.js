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

    syncServerList(true);
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

// Message helper
const formatLiveMessage = function (channelData, streamData) {
    let formattedMessage = `🔴 **${channelData.display_name} is live on Twitch**.` + "\r\n";
    formattedMessage += `${channelData.url}` + "\r\n";
    formattedMessage += `\`${channelData.status}\``;

    return formattedMessage;
};

// Start twitch monitor
TwitchMonitor.start();
TwitchMonitor.onChannelLiveUpdate((channelData) => {
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