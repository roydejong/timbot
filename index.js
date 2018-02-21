const config = require('./config.json');

const Discord = require('discord.js');
const client = new Discord.Client();
const TwitchMonitor = require("./twitch-monitor");

console.log('Timbot is starting.');

let targetChannels = [];

let getServerEmoji = (emojiName, asText) => {
    try {
        let emoji = client.emojis.find("name", emojiName);

        if (emoji) {
            if (asText) {
                return emoji.toString();
            } else {
                return emoji.id;
            }
        }
    } catch (e) {
        console.error(e);
    }

    return null;
};

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
    if (!message.content) {
        return;
    }

    let messageNormalized = message.content.toLowerCase();

    if (messageNormalized === "oh" || messageNormalized.startsWith("oh.") || messageNormalized.startsWith("oh!") || messageNormalized.startsWith("oh?")) {
        let ohEmoji = getServerEmoji("timOh", false);

        if (ohEmoji) {
            message.react(ohEmoji);
        }
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

// Listen to Twitch monitor events
let oldMsgs = { };

TwitchMonitor.onChannelLiveUpdate((channelData, streamData, isOnline) => {
    try {
        // Refresh channel list
        syncServerList(false);
    } catch (e) { }

    // Update activity
    StreamActivity.setChannelOnline(channelData);

    // Broadcast to all target channels
    let msgFormatted = `${channelData.display_name} went live on Twitch!`;

    let msgEmbed = new Discord.MessageEmbed({
        description: `:red_circle: **${channelData.display_name} is currently live on Twitch!**`,
        title: channelData.url,
        url: channelData.url
    });

    let cacheBustTs = (Date.now() / 1000).toFixed(0);

    msgEmbed.setColor(isOnline ? "RED" : "GREY");
    msgEmbed.setThumbnail(streamData.preview.medium + "?t=" + cacheBustTs);
    msgEmbed.addField("Game", streamData.game || "(No game)", true);
    msgEmbed.addField("Status", isOnline ? `Live for ${streamData.viewers} viewers` : 'Stream has now ended', true);
    msgEmbed.setFooter(channelData.status, channelData.logo);

    if (!isOnline) {
        msgEmbed.setDescription(`:white_circle:  ${channelData.display_name} was live on Twitch.`);
    }

    let anySent = false;

    for (let i = 0; i < targetChannels.length; i++) {
        let targetChannel = targetChannels[i];

        if (targetChannel) {
            try {
                // Either send a new message, or update an old one
                let messageDiscriminator = `${targetChannel.guild.name}_${targetChannel.name}_${channelData.name}_${streamData.created_at}`;
                let existingMessage = oldMsgs[messageDiscriminator] || null;

                if (existingMessage) {
                    // Updating existing message
                    existingMessage.edit(msgFormatted, {
                        embed: msgEmbed
                    }).then((message) => {
                        console.log('[Discord]', `Updated announce msg in #${targetChannel.name} on ${targetChannel.guild.name}`);
                    });

                    if (!isOnline) {
                        // Mem cleanup: If channel just went offline, delete the entry in the message list
                        delete oldMsgs[messageDiscriminator];
                    }
                } else {
                    // Sending a new message
                    if (!isOnline) {
                        // We do not post "new" notifications for channels going/being offline
                        continue;
                    }

                    // Expand the message with a @mention for "here" or "everyone"
                    // We don't do this in updates because it causes some people to get spammed
                    let mentionMode = (config.discord_mentions && config.discord_mentions[channelData.name.toLowerCase()]) || null;
                    let msgToSend = msgFormatted;

                    if (mentionMode) {
                        msgToSend = msgFormatted + ` @${mentionMode}`
                    }

                    targetChannel.send(msgFormatted, {
                        embed: msgEmbed
                    })
                    .then((message) => {
                        oldMsgs[messageDiscriminator] = message;
                        console.log('[Discord]', `Sent announce msg to #${targetChannel.name} on ${targetChannel.guild.name}`);
                    });
                }

                anySent = true;
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