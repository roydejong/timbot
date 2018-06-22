const config = require('./config.json');

const axios = require('axios');
const Cleverbot = require('clevertype').Cleverbot;

const Discord = require('discord.js');
const client = new Discord.Client();
global.discordJsClient = client;

const TwitchMonitor = require("./twitch-monitor");
const Voice = require("./voice");
const TwitterMonitor = require("./twitter-monitor");
const FooduseMonitor = require("./fooduse-monitor");
const DiscordChannelSync = require("./discord-channel-sync");

// --- Startup ---------------------------------------------------------------------------------------------------------
console.log('Timbot is starting.');

// --- Cleverbot init --------------------------------------------------------------------------------------------------
let cleverbot = null;

if (config.cleverbot_token) {
    cleverbot = new Cleverbot(config.cleverbot_token, true);
}

// --- Twitter monitor stuff -------------------------------------------------------------------------------------------
let twitterNames = config.twitter_names;
let twitterMonitor = null;

if (twitterNames && twitterNames.length > 0) {
    twitterMonitor = new TwitterMonitor(config.twitter_api_key, config.twitter_api_secret,
        config.twitter_access_token, config.twitter_access_token_secret, twitterNames);

    twitterMonitor.onNewTweet((tweet) => {
        for (let i = 0; i < targetChannels.length; i++) {
            let targetChannel = targetChannels[i];

            if (targetChannel) {
                try {
                    let tweetUrl = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
                    let messageText = `${tweet.user.name} (@${tweet.user.screen_name}) just Tweeted:\r\n${tweetUrl}`;

                    targetChannel.send(messageText);
                } catch (e) {
                    console.error('[TwitterAnnounce]', 'Could not post message in Discord:', targetChannel, e);
                }
            }
        }
    });
}

// --- Discord ---------------------------------------------------------------------------------------------------------
console.log('Connecting to Discord...');

let targetChannels = [];
let emojiCache = { };

let getServerEmoji = (emojiName, asText) => {
    if (typeof emojiCache[emojiName] !== "undefined") {
        return emojiCache[emojiName];
    }

    try {
        let emoji = client.emojis.find("name", emojiName);

        if (emoji) {
            emojiCache[emojiName] = emoji;

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
global.getServerEmoji = getServerEmoji;

let syncServerList = (logMembership) => {
    targetChannels = DiscordChannelSync.getChannelList(client, config.discord_announce_channel, logMembership);
};

client.on('ready', () => {
    console.log('[Discord]', `Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);

    // Init list of connected servers, and determine which channels we are announcing to
    syncServerList(true);

    // Keep our activity in the user list in sync
    StreamActivity.init(client);

    // Begin Twitch API polling
    TwitchMonitor.start();

    // Activate Food Use integration
    FooduseMonitor.start();

    if (twitterMonitor) {
        // Begin Twitter polling
        twitterMonitor.start();
    }
});

client.on("guildCreate", guild => {
    console.log(`[Discord]`, `Joined new server: ${guild.name}`);

    syncServerList(false);
});

client.on("guildDelete", guild => {
    console.log(`[Discord]`, `Removed from a server: ${guild.name}`);

    syncServerList(false);
});

let selloutList = [];

axios.get("https://twitch.center/customapi/quote/list?token=a912f99b")
.then((res) => {
    let data = res.data;
    let lines = data.split("\n");

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        selloutList.push(line);
    }

    console.log('[Sellout]', `Sellout list initialized from remote, ${selloutList.length} items`);
});

let selloutCheckTs = 0;
let selloutTimeout = null;

let doSelloutMessage = (channel) => {
    if (!selloutList.length) {
        return;
    }

    let randomLine = selloutList[Math.floor(Math.random()*selloutList.length)];

    if (!randomLine) {
        return;
    }

    let messageText = "Oh. I guess nightbot is out drinking again. I got this. ";
    messageText += "How many quality Amazon™ products are there? At least ";
    messageText += randomLine;

    try {
        channel.send(messageText);
        channel.stopTyping(true);
    } catch (e) {
        console.error('[Sellout] ERR:', e.toString());
    }
};

let lastTextReplyAt = 0;

client.on('message', message => {
    if (!message.content) {
        // Empty message
        return;
    }

    let txtPlain = message.content.toString().trim();
    let txtLower = txtPlain.toLowerCase();

    if (!txtLower.length) {
        // Whitespace or blank message
        return;
    }

    let txtNoPunct = txtLower;
    txtNoPunct = txtNoPunct.replaceAll(",", " ");
    txtNoPunct = txtNoPunct.replaceAll(".", " ");
    txtNoPunct = txtNoPunct.replaceAll("?", " ");
    txtNoPunct = txtNoPunct.replaceAll("!", " ");
    txtNoPunct = txtNoPunct.replaceAll("'", "");
    txtNoPunct = txtNoPunct.replaceAll(`"`, "");
    txtNoPunct = txtNoPunct.replaceAll("  ", " ");
    txtNoPunct = txtNoPunct.trim();

    if (txtLower === "!sellout" || txtLower.indexOf("amazon.com") >= 0 || txtLower.indexOf("amzn.to") >= 0) {
        // An amazon link was posted, or a new !sellout was called
        // (either way we bail - we don't want duplicates or spam)
        if (selloutTimeout) {
            clearTimeout(selloutTimeout);
            selloutTimeout = null;

            try {
                message.channel.stopTyping(true);
            } catch (e) { }
        }

        // We need to make sure we're listening for bots posting links too, obviously, so this code lives pre-botcheck
    }

    if (message.author.bot) {
        // Bot message
        // As a courtesy, we ignore all messages from bots (and, therefore, ourselves) to avoid any looping or spamming
        return;
    }

    // Auto join voice channels to say hi
    try {
        if (message.member && message.member.voiceChannel && config.voice_enabled) {
            Voice.join(message.member.voiceChannel);
        }
    } catch (e) { }

    let now = Date.now();

    try {
        // Determine individual words that were part of this message
        let txtWords = txtNoPunct.split(' ');

        // Determine the names of any users mentioned
        let mentionedUsernames = [];

        message.mentions.users.forEach((user) => {
            mentionedUsernames.push(user.username);
        });

        // Determine whether *we* were mentioned
        let timbotWasMentioned = (txtWords.indexOf("timbot") >= 0 || mentionedUsernames.indexOf("Timbot") >= 0);

        // Anti spam timer
        let lastTextReply = lastTextReplyAt || 0;
        let minutesSinceLastTextReply = Math.floor(((Date.now() - lastTextReply) / 1000) / 60);
        let okayToTextReply = (minutesSinceLastTextReply >= 1);

        let fnTextReply = function (txt, force, asNormal) {
            if (okayToTextReply || force) {
                try {
                    if (asNormal) {
                        message.channel.send(txt);
                    } else {
                        message.reply(txt);
                    }

                    lastTextReplyAt = now;
                } catch (e) {
                    console.error('[Chat]', 'Reply error:', e)
                }
            }

            if (message.member && message.member.voiceChannel && config.voice_enabled) {
                let ttsText = "";
                ttsText += message.member.user.username.spacifyCamels();
                ttsText += ", ";
                ttsText += txt;

                try {
                    Voice.say(message.member.voiceChannel, ttsText);
                } catch (e) {
                    console.error('[VoiceResponse]', 'Something broke:', e);
                }
            }

            try {
                message.channel.stopTyping();
            } catch (e) { }

            return true;
        };

        // Nightbot / !sellout helper
        if (txtLower === "!sellout" || (timbotWasMentioned && txtLower.indexOf("!sellout") >= 0)) {
            // Do a new sellout (either the "!sellout" command was used or someone mentioned "timbot" and "!sellout" together)
            message.channel.startTyping();

            selloutTimeout = setTimeout(() => {
                doSelloutMessage(message.channel);
            }, 3500);

            return;
        }

        let relationshipPlusEmoji = getServerEmoji("timPlus", false);
        let relationshipMinusEmoji = getServerEmoji("timMinus", false);

        // Timbot mentions
        if (timbotWasMentioned) {
            let isNegative = (txtWords.indexOf("not") >= 0 || txtLower.indexOf("n't") >= 0 ||
                txtWords.indexOf("bad") >= 0);

            // Youtube play --------------------------------------------------------------------------------------------
            if (txtPlain.indexOf("youtube.com/") >= 0 || txtPlain.indexOf("youtu.be/") >= 0) {
                let urls = txtPlain.match(/\bhttps?:\/\/\S+/gi);

                if (urls && urls.length !== 1) {
                    message.reply("give me one URL, bud. 🤷");

                    if (relationshipPlusEmoji) {
                        message.react(relationshipPlusEmoji);
                    }
                } else if (message.member.voiceChannel) {
                    Voice.playYoutubeUrl(message.member.voiceChannel, urls[0])
                        .then(() => {
                            message.react("🔊");

                            message.channel.stopTyping();
                        })
                        .catch((err) => {
                            message.reply("couldn't play that. sorry bud. 🤷");
                            message.react("❌");

                            console.error('[Playback Error Response]', err);
                        });
                } else {
                    message.reply("you're not even in a voice channel. 🤷");

                    if (relationshipMinusEmoji) {
                        message.react(relationshipMinusEmoji);
                    }
                }

            // Shut up -------------------------------------------------------------------------------------------------
            } else if (txtNoPunct.indexOf("shut up") >= 0 || txtNoPunct.indexOf("stop") >= 0 || txtNoPunct.indexOf("shutup") >= 0) {
                if (message.member.voiceChannel) {
                    Voice.shutUp(message.member.voiceChannel);
                    message.react("🔇");
                } else {
                    message.reply("you're not even in a voice channel. 🤷");

                    if (relationshipMinusEmoji) {
                        message.react(relationshipMinusEmoji);
                    }
                }
            // General mention -----------------------------------------------------------------------------------------
            } else {
                if (cleverbot) {
                    message.channel.startTyping();

                    let cleverInput = message.cleanContent;

                    cleverbot.say(cleverInput, message.member.user.discriminator)
                        .then((cleverOutput) => {
                            if (cleverOutput && cleverOutput.length) {
                                cleverOutput = cleverOutput.replaceAll("cleverbot", "Timbot");

                                fnTextReply(cleverOutput, true, true);
                            } else {
                                // No or blank response from CB
                                message.react("🤷");
                                message.channel.stopTyping(true);
                            }
                        })
                        .catch((err) => {
                            // Err, no CB response
                            message.react("❌");
                            message.channel.stopTyping(true);
                        });
                }
            }
        }

        // Easter egg: meme
        if (txtLower.indexOf("loss") >= 0) {
            lossEmoji = getServerEmoji("THINK_ABOUT_LOSS")

            if (lossEmoji) {
                message.react(lossEmoji);
            }

            if (relationshipMinusEmoji) {
                message.react(relationshipMinusEmoji);
            }

            return; // no stacking
        }

        if (txtLower.indexOf("meme") >= 0) {
            if (relationshipMinusEmoji) {
                message.react(relationshipMinusEmoji);
            }

            return; // no stacking
        }

        // Easter egg: timOh reaction
        if (txtNoPunct === "oh" || txtNoPunct.startsWith("oh ")) {
            let ohEmoji = getServerEmoji("timOh", false);

            if (ohEmoji) {
                message.react(ohEmoji);
            }
        }

        // Easter egg: timGuest420 reaction
        if (txtWords.indexOf("grass") >= 0 || txtLower.indexOf("420") >= 0
            || txtWords.indexOf("kush") >= 0 || txtWords.indexOf("weed") >= 0
            || txtLower.indexOf("aunt mary") >= 0 || txtWords.indexOf("ganja") >= 0
            || txtWords.indexOf("herb") >= 0 || txtWords.indexOf("joint") >= 0
            || txtWords.indexOf("juja") >= 0 || txtLower.indexOf("mary jane") >= 0
            || txtWords.indexOf("reefer") >= 0 || txtWords.indexOf("doobie") >= 0
            || txtWords.indexOf("cannabis") >= 0 || txtLower.indexOf("magic brownie") >= 0
            || txtWords.indexOf("bong") >= 0 || txtNoPunct.indexOf("devils lettuce") >= 0
            || txtLower.indexOf("marijuana") >= 0 || txtLower.indexOf("dime bag") >= 0
            || txtWords.indexOf("dimebag") >= 0 || txtWords.indexOf("toke") >= 0
            || txtWords.indexOf("blaze") >= 0 || txtWords.indexOf("blunt") >= 0
        ) {
            let guest420Emoji = getServerEmoji("timGuest420", false);

            if (guest420Emoji) {
                message.react(guest420Emoji);
            }
        }
    } catch (e) {
        console.error('Message processing / dumb joke error:', e, `<<< ${e.toString()} >>>`);
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

TwitchMonitor.onChannelLiveUpdate((twitchChannel, twitchStream, twitchChannelIsLive) => {
    try {
        // Refresh channel list
        syncServerList(false);
    } catch (e) { }

    // Update activity
    StreamActivity.setChannelOnline(twitchChannel);

    // Broadcast to all target channels
    let msgFormatted = `${twitchChannel.display_name} went live on Twitch!`;

    let msgEmbed = new Discord.MessageEmbed({
        description: `:red_circle: **${twitchChannel.display_name} is currently live on Twitch!**`,
        title: twitchChannel.url,
        url: twitchChannel.url
    });

    let cacheBustTs = (Date.now() / 1000).toFixed(0);

    msgEmbed.setColor(twitchChannelIsLive ? "RED" : "GREY");
    msgEmbed.setThumbnail(twitchStream.preview.medium + "?t=" + cacheBustTs);
    msgEmbed.addField("Game", twitchStream.game || "(No game)", true);
    msgEmbed.addField("Status", twitchChannelIsLive ? `Live for ${twitchStream.viewers} viewers` : 'Stream has now ended', true);
    msgEmbed.setFooter(twitchChannel.status, twitchChannel.logo);

    if (!twitchChannelIsLive) {
        msgEmbed.setDescription(`:white_circle:  ${twitchChannel.display_name} was live on Twitch.`);
    }

    let anySent = false;
    let didSendVoice = false;

    for (let i = 0; i < targetChannels.length; i++) {
        let targetChannel = targetChannels[i];

        if (targetChannel) {
            try {
                // Either send a new message, or update an old one
                let messageDiscriminator = `${targetChannel.guild.id}_${targetChannel.name}_${twitchChannel.name}_${twitchStream.created_at}`;
                let existingMessage = oldMsgs[messageDiscriminator] || null;

                if (existingMessage) {
                    // Updating existing message
                    existingMessage.edit(msgFormatted, {
                        embed: msgEmbed
                    }).then((message) => {
                        console.log('[Discord]', `Updated announce msg in #${targetChannel.name} on ${targetChannel.guild.name}`);
                    });

                    if (!twitchChannelIsLive) {
                        // Mem cleanup: If channel just went offline, delete the entry in the message list
                        delete oldMsgs[messageDiscriminator];
                    }
                } else {
                    // Sending a new message
                    if (!twitchChannelIsLive) {
                        // We do not post "new" notifications for channels going/being offline
                        continue;
                    }

                    // Expand the message with a @mention for "here" or "everyone"
                    // We don't do this in updates because it causes some people to get spammed
                    let mentionMode = (config.discord_mentions && config.discord_mentions[twitchChannel.name.toLowerCase()]) || null;
                    let msgToSend = msgFormatted;

                    if (mentionMode) {
                        msgToSend = msgFormatted + ` @${mentionMode}`
                    }

                    targetChannel.send(msgToSend, {
                        embed: msgEmbed
                    })
                    .then((message) => {
                        oldMsgs[messageDiscriminator] = message;
                        console.log('[Discord]', `Sent announce msg to #${targetChannel.name} on ${targetChannel.guild.name}`);
                    });

                    // Voice broadcast, looks like this is a new broadcast
                    if (config.voice_enabled && !didSendVoice) {
                        try {
                            let ttsMessage = `Hey, everyone. ${twitchChannel.name} just went live on Twitch. ${twitchChannel.status}.`;

                            if (twitchStream.game) {
                                ttsMessage += ` The game being played is "${twitchStream.game.toString()}".`;
                            }

                            Voice.sayEverywhere(ttsMessage);
                            didSendVoice = true;
                        } catch (e) { }
                    }
                }

                anySent = true;
            } catch (e) {
                console.warn('[Discord]', 'Message send problem:', e);
            }
        }
    }

    return anySent;
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
    if (oldMember && oldMember.voiceChannel) {
        Voice.handleChannelStateUpdate(oldMember.voiceChannel);
    }

    if (newMember && newMember.voiceChannel) {
        Voice.handleChannelStateUpdate(newMember.voiceChannel);
    }
});

TwitchMonitor.onChannelOffline((channelData) => {
    // Update activity
    StreamActivity.setChannelOffline(channelData);
});

// --- Common functions ------------------------------------------------------------------------------------------------
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

String.prototype.spacifyCamels = function () {
    let target = this;

    try {
        return target.replace(/([a-z](?=[A-Z]))/g, '$1 ');
    } catch (e) {
        return target;
    }
};

Array.prototype.joinEnglishList = function () {
    let a = this;

    try {
        return [a.slice(0, -1).join(', '), a.slice(-1)[0]].join(a.length < 2 ? '' : ' and ');
    } catch (e) {
        return a.join(', ');
    }
};

String.prototype.lowercaseFirstChar = function () {
    let string = this;
    return string.charAt(0).toUpperCase() + string.slice(1);
};