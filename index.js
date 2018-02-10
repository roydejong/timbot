const config = require('./config.json');

const Discord = require('discord.js');
const client = new Discord.Client();
const TwitchMonitor = require("./twitch-monitor");

console.log('Timbot is starting.');

let targetChannel = null;

client.on('ready', () => {
    console.log('[Discord]', 'Bot has logged in, and is now online.');

    client.user.setStatus("online");
    client.user.setActivity({game: {name: "test 123", type: 0}});

    targetChannel = client.channels.find("name", config.discord_channel);
});

client.on('message', message => {
    if (!targetChannel) {
        targetChannel = message.guild.channels.find("name", config.discord_channel);
    }

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
    if (!targetChannel) {
        return false;
    }

    targetChannel.send(formatLiveMessage(channelData));
    return true;
});