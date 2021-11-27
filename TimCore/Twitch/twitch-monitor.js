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
const configmain = require('../../TimSys/config/config.json');
const chalk = require('chalk');
const { DateTime } = require('luxon');
const timeFormat = 'LL'+'/'+'dd'+'/'+'yyyy'+'-'+'h'+':'+'mm'+':'+'ss'+'-'+'a';
const SQLite = require("better-sqlite3");
require('dotenv').config();
const TwitchApi = require('./twitch-api');
const MiniDb = require('./minidb');

const sql_Onoff = new SQLite('./Database/sqlite/config/onoff.sqlite');
const sql_Twitch = new SQLite('./Database/sqlite/twitch.sqlite');
if(configmain) {
    // Check if the table "points" exists.
    const tableName = sql_Twitch.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'twitchchannel';").get();
    if (!tableName['count(*)']) {
        // If the table isn't there, create it and setup the database correctly.
        sql_Twitch.prepare("CREATE TABLE twitchchannel (TwitchChannelID TEXT PRIMARY KEY, ChannelList TEXT, ChannelList2 TEXT);").run();
        // Ensure that the "id" row is always unique and indexed.
        sql_Twitch.prepare("CREATE UNIQUE INDEX idx_twitchchannel_id ON twitchchannel (TwitchChannelID);").run();
        sql_Twitch.pragma("synchronous = 1");
        sql_Twitch.pragma("journal_mode = wal");
    }

    // And then we have two prepared statements to get and set the score data.
    client.getTwitchAPI = sql_Twitch.prepare("SELECT * FROM twitchchannel",null);
};
client.getTwitch = sql_Onoff.prepare("SELECT * FROM twitch");
// client.getTwitchAPI = sql_Twitch.prepare("SELECT * FROM twitchchannel");
// for (const row_twitchChannel of client.getTwitchAPI.all()) {
    dataTwitchChannelList = client.getTwitchAPI.all()
    var arrayOfStrings1 = dataTwitchChannelList.map(function(obj) {
        return obj.ChannelList;
    });
    let stringchannelList1 = arrayOfStrings1.toString()
    // console.log(stringchannelList);
    class TwitchMonitor {
        static __init() {
            this._userDb = new MiniDb("twitch-users-v2");
            this._gameDb = new MiniDb("twitch-games");

            this._lastUserRefresh = this._userDb.get("last-update") || null;
            this._pendingUserRefresh = false;
            this._userData = this._userDb.get("user-list") || { };

            this._pendingGameRefresh = false;
            this._gameData = this._gameDb.get("game-list") || { };
            this._watchingGameIds = [];
        }

        static start() {
            // Load channel names from config
            
                this.channelNames = [];
                stringchannelList1.split(',').forEach((channelName) => {
                    if (channelName) {
                        this.channelNames.push(channelName.toLowerCase());
                    }
                });
                if (!this.channelNames.length) {
                    console.warn(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + '][TwitchMonitor]', chalk.white('No channels configured')));
                    return;
                }

                // Configure polling interval
                let checkIntervalMs = parseInt(configmain.twitch_check_interval_ms);
                if (isNaN(checkIntervalMs) || checkIntervalMs < TwitchMonitor.MIN_POLL_INTERVAL_MS) {
                    // Enforce minimum poll interval to help avoid rate limits
                    checkIntervalMs = TwitchMonitor.MIN_POLL_INTERVAL_MS;
                }
                setInterval(() => {
                    for (const row_Twitch of client.getTwitch.all()) {
                        if(row_Twitch.True === 'true') {
                            this.refresh("Periodic refresh");
                        }
                    }
                }, checkIntervalMs + 1000);

                // Immediate refresh after startup
                setTimeout(() => {
                    for (const row_Twitch of client.getTwitch.all()) {
                        if(row_Twitch.True === 'true') {
                            this.refresh("Initial refresh after start-up");
                        }
                    }
                }, 1000);

                // Ready!
                console.log(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][TwitchMonitor]', chalk.white(`Configured stream status polling for channels:`, this.channelNames.join(', '),
                `(${checkIntervalMs}ms interval)`)));
            
        }

        static refresh(reason) {
            const now = DateTime.utc();
            console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + '][Twitch]', chalk.white(' ▪ ▪ ▪ ▪ ▪ ', `Refreshing now (${reason ? reason : "No reason"})`, ' ▪ ▪ ▪ ▪ ▪ ')));

            // Refresh all users periodically
            if (this._lastUserRefresh === null || now.diff(DateTime.utc(this._lastUserRefresh), 'minutes') >= 10) {
                this._pendingUserRefresh = true;
                TwitchApi.fetchUsers(this.channelNames)
                .then((users) => {
                    this.handleUserList(users);
                })
                .catch((err) => { 
                    console.warn(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][TwitchMonitor]' + chalk.white('Error in users refresh:', err)));
                })
                .then(() => {
                    if (this._pendingUserRefresh) {
                        this._pendingUserRefresh = false;
                        this.refresh('Got Twitch users, need to get streams');
                    }
                })
            }

            // Refresh all games if needed
            if (this._pendingGameRefresh) {
                TwitchApi.fetchGames(this._watchingGameIds)
                .then((games) => {
                    this.handleGameList(games);
                })
                .catch((err) => { 
                    console.warn(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][TwitchMonitor]', chalk.white('Error in games refresh:', err)));
                })
                .then(() => {
                    if (this._pendingGameRefresh) {
                        this._pendingGameRefresh = false;
                    }
                });
            }

            // Refresh all streams
            if (!this._pendingUserRefresh && !this._pendingGameRefresh) {
                TwitchApi.fetchStreams(this.channelNames)
                .then((channels) => {
                    this.handleStreamList(channels);
                })
                .catch((err) => {  
                    console.warn(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][TwitchMonitor]', chalk.white('Error in streams refresh:', err)));
                });
            }
        }

        static handleUserList(users) {
            let namesSeen = [];

            users.forEach((user) => {
                let prevUserData = this._userData[user.id] || { };
                this._userData[user.id] = Object.assign({ }, prevUserData, user);

                namesSeen.push(user.display_name);
            });

            if (namesSeen.length) {
                console.debug(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + '][TwitchMonitor]', chalk.white('Updated user info:', namesSeen.join(', '))));
            }

            this._lastUserRefresh = DateTime.utc();

            this._userDb.put("last-update", this._lastUserRefresh);
            this._userDb.put("user-list", this._userData);
        }

        static handleGameList(games) {
            let gotGameNames = [];

            games.forEach((game) => {
                const gameId = game.id;

                let prevGameData = this._gameData[gameId] || { };
                this._gameData[gameId] = Object.assign({ }, prevGameData, game);

                gotGameNames.push(`${game.id} → ${game.name}`);
            });

            if (gotGameNames.length) {
                console.debug(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + '][TwitchMonitor]', chalk.white('Updated game info:', gotGameNames.join(', '))));
            }

            this._lastGameRefresh = DateTime.utc();

            this._gameDb.put("last-update", this._lastGameRefresh);
            this._gameDb.put("game-list", this._gameData);
        }

        static handleStreamList(streams) {
            // Index channel data & build list of stream IDs now online
            let nextOnlineList = [];
            let nextGameIdList = [];

            streams.forEach((stream) => {
                const channelName = stream.user_name.toLowerCase();

                if (stream.type === "live") {
                    nextOnlineList.push(channelName);
                }

                let userDataBase = this._userData[stream.user_id] || { };
                let prevStreamData = this.streamData[channelName] || { };

                this.streamData[channelName] = Object.assign({ }, userDataBase, prevStreamData, stream);
                this.streamData[channelName].game = (stream.game_id && this._gameData[stream.game_id]) || null;
                this.streamData[channelName].user = userDataBase;

                if (stream.game_id) {
                    nextGameIdList.push(stream.game_id);
                }
            });

            // Find channels that are now online, but were not before
            let notifyFailed = false;
            let anyChanges = false;

            for (let i = 0; i < nextOnlineList.length; i++) {
                let _chanName = nextOnlineList[i];

                if (this.activeStreams.indexOf(_chanName) === -1) {
                    // Stream was not in the list before
                    console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + '][TwitchMonitor]', chalk.white('Stream channel has gone online:', _chanName)));
                    anyChanges = true;
                }

                if (!this.handleChannelLiveUpdate(this.streamData[_chanName], true)) {
                    notifyFailed = true;
                }
            }

            // Find channels that are now offline, but were online before
            for (let i = 0; i < this.activeStreams.length; i++) {
                let _chanName = this.activeStreams[i];

                if (nextOnlineList.indexOf(_chanName) === -1) {
                    // Stream was in the list before, but no longer
                    console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + '][TwitchMonitor]', chalk.white('Stream channel has gone offline:', _chanName)));
                    this.streamData[_chanName].type = "detected_offline";
                    this.handleChannelOffline(this.streamData[_chanName]);
                    anyChanges = true;
                }
            }

            if (!notifyFailed) {
                // Notify OK, update list
                this.activeStreams = nextOnlineList;
            } else {
                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + '][TwitchMonitor]', chalk.white('Could not notify channel, will try again next update.')));
            }

            if (!this._watchingGameIds.hasEqualValues(nextGameIdList)) {
                // We need to refresh game info
                this._watchingGameIds = nextGameIdList;
                this._pendingGameRefresh = true;
                this.refresh("Need to request game data");
            }
        }

        static handleChannelLiveUpdate(streamData, isOnline) {
            for (let i = 0; i < this.channelLiveCallbacks.length; i++) {
                let _callback = this.channelLiveCallbacks[i];

                if (_callback) {
                    if (_callback(streamData, isOnline) === false) {
                        return false;
                    }
                }
            }

            return true;
        }

        static handleChannelOffline(streamData) {
            this.handleChannelLiveUpdate(streamData, false);

            for (let i = 0; i < this.channelOfflineCallbacks.length; i++) {
                let _callback = this.channelOfflineCallbacks[i];

                if (_callback) {
                    if (_callback(streamData) === false) {
                        return false;
                    }
                }
            }

            return true;
        }

        static onChannelLiveUpdate(callback) {
            this.channelLiveCallbacks.push(callback);
        }

        static onChannelOffline(callback) {
            this.channelOfflineCallbacks.push(callback);
        }
    }


    TwitchMonitor.activeStreams = [];
    TwitchMonitor.streamData = { };

    TwitchMonitor.channelLiveCallbacks = [];
    TwitchMonitor.channelOfflineCallbacks = [];

    TwitchMonitor.MIN_POLL_INTERVAL_MS = 30000;

    module.exports = TwitchMonitor;

    TwitchMonitor.__init();
// }
