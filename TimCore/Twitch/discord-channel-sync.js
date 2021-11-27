const Discord = require('discord.js');
const { Intents } = Discord;
const client = new Discord.Client({
    intents:
    [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_INVITES
    ]
    , partials:
    [
        "GUILD_MEMBER"
    ]
});
const chalk = require('chalk');
const { DateTime } = require('luxon');
const timeFormat = 'LL'+'/'+'dd'+'/'+'yyyy'+'-'+'h'+':'+'mm'+':'+'ss'+'-'+'a';
const SQLite = require("better-sqlite3");

        /**
         * Helper class for syncing discord target channels.
         */
        class DiscordChannelSync {
            /**
             * @param {Client} client Discord.js client.
             * @param {string} channelName Name of the Discord channel we are looking for on each server (e.g. `config.discord_announce_channel`).
             * @param {boolean} verbose If true, log guild membership info to stdout (debug / info purposes).
             * @return {Channel[]} List of Discord.js channels
             */
            static getChannelList(client, channelName, verbose) {
                const sql_Onoff = new SQLite('./Database/sqlite/config/onoff.sqlite');
                client.getTwitch = sql_Onoff.prepare("SELECT * FROM twitch");
                for (const row_Twitch of client.getTwitch./*iterate*/all()) {
                    if(row_Twitch.True === 'true') {
                        let nextTargetChannels = [];

                        client.guilds.cache.forEach((guild) => {
                            let targetChannel = guild.channels.cache.find(g => g.name === channelName);
                            if (!targetChannel) {
                                if (verbose) {
                                    console.warn(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][Discord]', chalk.white('Configuration problem /!\\', `Guild ${guild.name} does not have a #${channelName} channel!`)));
                                }
                            } else {
                                let permissions = targetChannel.permissionsFor(guild.me);

                                if (verbose) {
                                    console.log(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][Discord]', chalk.white(' --> ', `Member of server ${guild.name}, target channel is #${targetChannel.name}`)));
                                }

                                if (!permissions.has("SEND_MESSAGES")) {
                                    if (verbose) {
                                        console.warn(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][Discord]', chalk.white('Permission problem /!\\', `I do not have SEND_MESSAGES permission on channel #${targetChannel.name} on ${guild.name}: announcement sends will fail.`)));
                                    }
                                }

                                nextTargetChannels.push(targetChannel);
                            }
                        });

                        if (verbose) {
                            console.log(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][Discord]', chalk.white(`Discovered ${nextTargetChannels.length} channels to announce to for ${channelName}.`)));
                        }

                        return nextTargetChannels;
                    }
                }
            }
        }

        module.exports = DiscordChannelSync;
