const config = require('./config.json');

const axios = require('axios');
const Cleverbot = require('clevertype').Cleverbot;

const Discord = require('discord.js');
const client = new Discord.Client();
global.discordJsClient = client;

const TwitchMonitor = require("./twitch-monitor");
const FooduseMonitor = require("./fooduse-monitor");
const DiscordChannelSync = require("./discord-channel-sync");
const ElizaHelper = require('./eliza');
const LiveEmbed = require('./live-embed');
const MiniDb = require('./minidb');

// --- Startup ---------------------------------------------------------------------------------------------------------
console.log('Timbot is starting.');

// --- Cleverbot init --------------------------------------------------------------------------------------------------
let cleverbot = null;

if (config.cleverbot_token) {
    cleverbot = new Cleverbot({
        apiKey: config.cleverbot_token,
        emotion: 0,
        engagement: 0,
        regard: 100
    }, true);
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
        let emoji = client.emojis.cache.find(e => e.name === emojiName);

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
    console.log('[Discord]', `Bot is ready; logged in as ${client.user.tag}.`);

    // Init list of connected servers, and determine which channels we are announcing to
    syncServerList(true);

    // Keep our activity in the user list in sync
    StreamActivity.init(client);

    // Begin Twitch API polling
    TwitchMonitor.start();

    // Activate Food Use integration
    FooduseMonitor.start();
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
        let elizaWasMentioned = (txtWords.indexOf("eliza") >= 0);
        let elizaWasOn = ElizaHelper.isActiveForUser(message.author);
        let elizaModeOn = (elizaWasMentioned || elizaWasOn);

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
        if (timbotWasMentioned || elizaWasMentioned) {
            // --- Eliza start ---
            if (elizaModeOn) {
                let isEnding = txtNoPunct.indexOf("goodbye") >= 0 || txtNoPunct.indexOf("good bye") >= 0;
                let isStarting = !isEnding && !elizaWasOn;

                message.channel.startTyping();

                if (isEnding) {
                    ElizaHelper.end(message);
                } else if (isStarting) {
                    ElizaHelper.start(message);
                } else {
                    ElizaHelper.reply(message);
                }

                return;
            }
            // --- Eliza eof ---

            let isNegative = (txtWords.indexOf("not") >= 0 || txtLower.indexOf("n't") >= 0 ||
                txtWords.indexOf("bad") >= 0);

            // General mention -----------------------------------------------------------------------------------------

                if (cleverbot) {
                    message.channel.startTyping();

                    let cleverInput = message.cleanContent;
                    console.log(cleverInput, message.member.user.discriminator);

                    cleverbot.say(cleverInput, message.member.user.discriminator)
                        .then((cleverOutput) => {
                            console.log(cleverOutput);
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
                            console.log(err);
                            message.react("❌");
                            message.channel.stopTyping(true);
                        });
                }
        }

        // Food use integration
        if (txtLower.indexOf("food use") >= 0 || txtLower.indexOf("food dip") >= 0 ||
            txtLower.indexOf("fooddip") >= 0 || txtLower.indexOf("fooduse") >= 0) {
            let bobmoji = getServerEmoji("BOB_EATS");

            if (bobmoji) {
                message.react(bobmoji);
            }
        }

        // Easter egg: meme
        if (txtLower.indexOf("loss") >= 0) {
            let lossEmoji = getServerEmoji("THINK_ABOUT_LOSS");

            if (lossEmoji) {
                message.react(lossEmoji);
            }
        }

        if (txtLower.indexOf("meme") >= 0) {
            if (relationshipMinusEmoji) {
                message.react(relationshipMinusEmoji);
            }
        }

        // Easter egg: timOh reaction
        if (txtNoPunct === "oh" || txtLower.startsWith("oh.")) {
            let ohEmoji = getServerEmoji("timOh", false);

            if (ohEmoji) {
                message.react(ohEmoji);
            }
        }

        // Gay
        let gayWords = ["gay", "queer", "homo", "pride"];

        for (let i = 0; i < gayWords.length; i++) {
            let _gayWord = gayWords[i];

            if (txtLower.indexOf(_gayWord) >= 0) {
                message.react("🏳️‍🌈");
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
            let fourtwentyEmoji = getServerEmoji("timGuest420", false);

            if (fourtwentyEmoji) {
                message.react(fourtwentyEmoji);
            }
        }

        // 4head
        if (txtWords.indexOf('4head') >= 0) {
            let fourheadEmoji = getServerEmoji("4head", false);

            if (fourheadEmoji) {
                message.react(fourheadEmoji);
            }
        }

        // hahaa
        if (txtWords.indexOf('hahaa') >= 0) {
            let hahaaEmoji = getServerEmoji("hahaa", false);

            if (hahaaEmoji) {
                message.react(hahaaEmoji);
            }
        }

        // beat saber
        if (txtWords.indexOf('beatsaber') >= 0 || txtLower.indexOf('beat saber') >= 0) {
            let beatsaberEmoji = getServerEmoji("beatsaber", false);

            if (beatsaberEmoji) {
                message.react(beatsaberEmoji);
            }
        }

        // clap
        if (txtWords.indexOf('clap') >= 0) {
            let clapEmoji = getServerEmoji("ClapClap", false);

            if (clapEmoji) {
                message.react(clapEmoji);
            }
        }
    } catch (e) {
        console.error('Message processing / dumb joke error:', e, `<<< ${e.toString()} >>>`);
    }
});

console.log('[Discord]', 'Logging in...');
client.login(config.discord_bot_token);

// Activity updater
class StreamActivity {
    /**
     * Registers a channel that has come online, and updates the user activity.
     */
    static setChannelOnline(stream) {
        this.onlineChannels[stream.user_name] = stream;

        this.updateActivity();
    }

    /**
     * Marks a channel has having gone offline, and updates the user activity if needed.
     */
    static setChannelOffline(stream) {
        delete this.onlineChannels[stream.user_name];

        this.updateActivity();
    }

    /**
     * Fetches the channel that went online most recently, and is still currently online.
     */
    static getMostRecentStreamInfo() {
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
        let streamInfo = this.getMostRecentStreamInfo();

        if (streamInfo) {
            this.discordClient.user.setActivity(streamInfo.user_name, {
                "url": `https://twitch.tv/${streamInfo.user_name.toLowerCase()}`,
                "type": "STREAMING"
            });

            console.log('[StreamActivity]', `Update current activity: watching ${streamInfo.user_name}.`);
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

// ---------------------------------------------------------------------------------------------------------------------
// Live events

let liveMessageDb = new MiniDb('live-messages');
let messageHistory = liveMessageDb.get("history") || { };

TwitchMonitor.onChannelLiveUpdate((streamData) => {
    const isLive = streamData.type === "live";

    // Refresh channel list
    try {
        syncServerList(false);
    } catch (e) { }

    // Update activity
    StreamActivity.setChannelOnline(streamData);

    // Generate message
    const msgFormatted = `${streamData.user_name} went live on Twitch!`;
    const msgEmbed = LiveEmbed.createForStream(streamData);

    // Broadcast to all target channels
    let anySent = false;

    for (let i = 0; i < targetChannels.length; i++) {
        const discordChannel = targetChannels[i];
        const liveMsgDiscrim = `${discordChannel.guild.id}_${discordChannel.name}_${streamData.id}`;

        if (discordChannel) {
            try {
                // Either send a new message, or update an old one
                let existingMsgId = messageHistory[liveMsgDiscrim] || null;

                if (existingMsgId) {
                    // Fetch existing message
                    discordChannel.messages.fetch(existingMsgId)
                      .then((existingMsg) => {
                        existingMsg.edit(msgFormatted, {
                          embed: msgEmbed
                        }).then((message) => {
                          // Clean up entry if no longer live
                          if (!isLive) {
                            delete messageHistory[liveMsgDiscrim];
                            liveMessageDb.put('history', messageHistory);
                          }
                        });
                      })
                      .catch((e) => {
                        // Unable to retrieve message object for editing
                        if (e.message === "Unknown Message") {
                            // Specific error: the message does not exist, most likely deleted.
                            delete messageHistory[liveMsgDiscrim];
                            liveMessageDb.put('history', messageHistory);
                            // This will cause the message to be posted as new in the next update if needed.
                        }
                      });
                } else {
                    // Sending a new message
                    if (!isLive) {
                        // We do not post "new" notifications for channels going/being offline
                        continue;
                    }

                    // Expand the message with a @mention for "here" or "everyone"
                    // We don't do this in updates because it causes some people to get spammed
                    let mentionMode = (config.discord_mentions && config.discord_mentions[streamData.user_name.toLowerCase()]) || null;

                    if (mentionMode) {
                        mentionMode = mentionMode.toLowerCase();

                        if (mentionMode === "everyone" || mentionMode === "here") {
                            // Reserved @ keywords for discord that can be mentioned directly as text
                            mentionMode = `@${mentionMode}`;
                        } else {
                            // Most likely a role that needs to be translated to <@&id> format
                            let roleData = discordChannel.guild.roles.cache.find((role) => {
                                return (role.name.toLowerCase() === mentionMode);
                            });

                            if (roleData) {
                                mentionMode = `<@&${roleData.id}>`;
                            } else {
                                console.log('[Discord]', `Cannot mention role: ${mentionMode}`,
                                  `(does not exist on server ${discordChannel.guild.name})`);
                                mentionMode = null;
                            }
                        }
                    }

                    let msgToSend = msgFormatted;

                    if (mentionMode) {
                        msgToSend = msgFormatted + ` ${mentionMode}`
                    }

                    let msgOptions = {
                        embed: msgEmbed
                    };

                    discordChannel.send(msgToSend, msgOptions)
                        .then((message) => {
                            console.log('[Discord]', `Sent announce msg to #${discordChannel.name} on ${discordChannel.guild.name}`)

                            messageHistory[liveMsgDiscrim] = message.id;
                            liveMessageDb.put('history', messageHistory);
                        })
                        .catch((err) => {
                            console.log('[Discord]', `Could not send announce msg to #${discordChannel.name} on ${discordChannel.guild.name}:`, err.message);
                        });
                }

                anySent = true;
            } catch (e) {
                console.warn('[Discord]', 'Message send problem:', e);
            }
        }
    }

    liveMessageDb.put('history', messageHistory);
    return anySent;
});

TwitchMonitor.onChannelOffline((streamData) => {
    // Update activity
    StreamActivity.setChannelOffline(streamData);
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

Array.prototype.hasEqualValues = function (b) {
    let a = this;

    if (a.length !== b.length) {
        return false;
    }

    a.sort();
    b.sort();

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}