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
const axios = require('axios');
const { DateTime } = require('luxon');
const timeFormat = 'LL'+'/'+'dd'+'/'+'yyyy'+'-'+'h'+':'+'mm'+':'+'ss'+'-'+'a';
const SQLite = require("better-sqlite3");
require('dotenv').config();

  /**
   * Twitch Helix API helper ("New Twitch API").
   */
  class TwitchApi {
    static get requestOptions() {
      const sql_twitch = new SQLite('./Database/sqlite/twitch.sqlite');
      client.getToken = sql_twitch.prepare("SELECT * FROM twitchrequest ");
      for (const row_twitch of client.getToken.all()) {
        // Automatically remove "oauth:" prefix if it's present
        const oauthPrefix = "oauth:";
        let oauthBearer = row_twitch.Token;
        // console.log(row_twitch.Token)
        // console.log(oauthBearer)
        if (oauthBearer.startsWith(oauthPrefix)) {
          oauthBearer = oauthBearer.substr(oauthPrefix.length);
        }
        // Construct default request options
        return {
          baseURL: "https://api.twitch.tv/helix/",
          headers: {
            "Client-ID": process.env.TWITCH_CLIENT_ID,
            "Authorization": `Bearer ${oauthBearer}`
          }
        };
      }
    };

    static handleApiError(err) {
      const res = err.response || { };
      console.log(res.data);

      if (res.data && res.data.message) {
        console.error(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][TwitchApi]', chalk.white('API request failed with Helix error:', res.data.message, `(${res.data.error}/${res.data.status})`)));
      } else {
        console.error(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][TwitchApi]', chalk.white('API request failed with error:', err.message || err)));
      };
    };

    static fetchStreams(channelNames) {
      return new Promise((resolve, reject) => {
        axios.get(`/streams?user_login=${channelNames.join('&user_login=')}`, this.requestOptions)
          .then((res) => {
            resolve(res.data.data || []);
          })
          .catch((err) => {
            this.handleApiError(err);
            reject(err);
          });
          // console.log(this.requestOptions);
      });
    };

    static fetchUsers(channelNames) {
      return new Promise((resolve, reject) => {
        axios.get(`/users?login=${channelNames.join('&login=')}`, this.requestOptions)
          .then((res) => {
            resolve(res.data.data || []);
          })
          .catch((err) => {
            this.handleApiError(err);
            reject(err);
          });
      });
    };

    static fetchGames(gameIds) {
      return new Promise((resolve, reject) => {
        axios.get(`/games?id=${gameIds.join('&id=')}`, this.requestOptions)
          .then((res) => {
            resolve(res.data.data || []);
          })
          .catch((err) => {
            this.handleApiError(err);
            reject(err);
          });
      });
    };
  };

module.exports = TwitchApi;
