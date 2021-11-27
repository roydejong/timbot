
module.exports = (client, chalk, args, Discord) => {
    const { MessageActionRow, MessageButton } = require('discord.js');
    require('dotenv').config();
    const configmain = require('../../TimSys/config/config.json');
    const { DateTime } = require('luxon');
    const timeFormat = 'LL'+'/'+'dd'+'/'+'yyyy'+'-'+'h'+':'+'mm'+':'+'ss'+'-'+'a';
    const SQLite = require("better-sqlite3");
    const sql_Onoff = new SQLite('./Database/sqlite/config/onoff.sqlite');
    const sql_ChannelRole = new SQLite('./Database/sqlite/config/channelRole.sqlite');
    const sql_TwitchChannel = new SQLite('./Database/sqlite/twitch.sqlite')
    client.getLang = sql_Onoff.prepare("SELECT * FROM lang");
    client.getChannelAnnounce = sql_ChannelRole.prepare("SELECT * FROM channel_user");
    //Twitch const
    global.discordJsClient = client;
    const TwitchMonitor = require("./twitch-monitor");
    const FooduseMonitor = require("./fooduse-monitor");
    const DiscordChannelSync = require("./discord-channel-sync");
    const LiveEmbed = require('./live-embed');
    const MiniDb = require('./minidb');
    for (const row_lang of client.getLang.all()) {
        let lang = require('../.' + row_lang.LangSet);
        for (const row_channelAnnounce of client.getChannelAnnounce.all()) {
            client.on('ready', () => {
                
                    // Init list of connected servers, and determine which channels we are announcing to
                    syncServerList(true);

                    // Keep our activity in the user list in sync
                    StreamActivity.init(client);

                    // Begin Twitch API polling
                    TwitchMonitor.start();

                    // Activate Food Use integration
                    FooduseMonitor.start();
                
            });

            // let target
            let syncServerList = (logMembership) => {
                targetChannels = DiscordChannelSync.getChannelList(client, row_channelAnnounce.Announce1, logMembership);
            };

            client.on("guildJoin", guild => {
                console.log(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][Discord]'), chalk.white(`Joined new server: ${guild.name}`));
            });

            client.on("guildLeave", guild => {
                console.log(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][Discord]'), chalk.white(`Removed from a server: ${guild.name}`));
            });

            //Discord
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
                    console.error(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][Error]'), chalk.white(e));
                }
                return null;
            };
            global.getServerEmoji = getServerEmoji;
            //Twitch
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
                        console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + '][StreamActivity]'), chalk.white(`Update current activity: watching ${streamInfo.user_name}.`));
                    } else {
                        console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + '][StreamActivity]'), chalk.white('Cleared current activity.'));
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
                const msgFormatted = `${streamData.user_name}${lang.twitch.wentlive}`;
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
                                    client.getTwitchChannel = sql_TwitchChannel.prepare("SELECT * FROM twitchchannel WHERE ChannelList = ?");
                                    dataTwitchChannel = client.getTwitchChannel.get(streamData.user_name.toLowerCase())
                                    let mentionMode = dataTwitchChannel.Mention || null;
                                    if (mentionMode) {
                                        mentionMode = mentionMode.toLowerCase();
                                        if (mentionMode === "everyone" || mentionMode === "here") {
                                            // Reserved @ keywords for discord that can be mentioned directly as text
                                            mentionMode = `@${mentionMode}`;
                                        } else {
                                            // Most likely a role that needs to be translated to <@&id> format
                                            let roleData = discordChannel.guild.roles.cache.find((role) => {
                                                return (role.id === mentionMode);
                                            });
                                            if (roleData) {
                                                mentionMode = `<@&${roleData.id}>`;
                                            } else {
                                            console.log(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][Discord]'), chalk.white(`Cannot mention role: ${mentionMode}`,
                                            `(does not exist on server ${discordChannel.guild.name})`));
                                            mentionMode = null;
                                            }
                                        }
                                    }
                                    let msgToSend = msgFormatted;
                                    if (mentionMode) {
                                        msgToSend = msgFormatted + ` ${mentionMode}`
                                    }
                                    existingMsg.edit({content: msgToSend, embeds: [msgEmbed]}).then((message) => {
                                        // Clean up entry if no longer live
                                        if (!isLive) {
                                            const row = new MessageActionRow()
                                            .addComponents(
                                                new MessageButton()
                                                    .setLabel('Follow to not miss again!')
                                                    .setURL(`https://twitch.tv/${streamData.user_name}`)
                                                    .setStyle('LINK'),
                                            );
                                            existingMsg.edit({ content: msgToSend, embeds: [msgEmbed], components: [row]})
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
                                client.getTwitchChannel = sql_TwitchChannel.prepare("SELECT * FROM twitchchannel WHERE ChannelList = ?");
                                dataTwitchChannel = client.getTwitchChannel.get(streamData.user_name.toLowerCase())
                                let mentionMode = dataTwitchChannel.Mention || null;
                                if (mentionMode) {
                                    mentionMode = mentionMode.toLowerCase();
                                    if (mentionMode === "everyone" || mentionMode === "here") {
                                        // Reserved @ keywords for discord that can be mentioned directly as text
                                        mentionMode = `@${mentionMode}`;
                                    } else {
                                        // Most likely a role that needs to be translated to <@&id> format
                                        let roleData = discordChannel.guild.roles.cache.find((role) => {
                                            return (role.id === mentionMode);
                                        });
                                        if (roleData) {
                                            mentionMode = `<@&${roleData.id}>`;
                                        } else {
                                        console.log(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][Discord]'), chalk.white(`Cannot mention role: ${mentionMode}`,
                                        `(does not exist on server ${discordChannel.guild.name})`));
                                        mentionMode = null;
                                        }
                                    }
                                }
                                let msgToSend = msgFormatted;
                                if (mentionMode) {
                                    msgToSend = msgFormatted + ` ${mentionMode}`
                                }
                                const row = new MessageActionRow()
                                    .addComponents(
                                        new MessageButton()
                                            .setLabel('Watch it Now!')
                                            .setURL(`https://twitch.tv/${streamData.user_name}`)
                                            .setStyle('LINK'),
                                    );
                                discordChannel.send({ content: msgToSend, embeds: [msgEmbed], components: [row]})
                                .then((message) => {
                                    console.log(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][Discord]'), chalk.white(`Sent announce msg to #${discordChannel.name} on ${discordChannel.guild.name}`));
                                    // message.edit(msgToSend, {embeds: [msgEmbed]})
                                    messageHistory[liveMsgDiscrim] = message.id;
                                    liveMessageDb.put('history', messageHistory);
                                })
                                .catch((error) => {
                                    console.log(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][Discord]'), chalk.white(`Could not send announce msg to #${discordChannel.name} on ${discordChannel.guild.name}:`, error));
                                });
                            }
                            anySent = true;
                        } catch (e) {
                        console.warn(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][Discord]'), chalk.white('Message send problem:', e));
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
            //Error listener
            client.on('unhandledRejection', error => {
                console.log(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.error.unhandled), chalk.white(error));
            });
            client.on('shardError', error => {
                console.log(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.error.websocket), chalk.white(error));
            });
        }
    }
}
