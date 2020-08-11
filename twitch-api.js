const axios = require('axios');
const config = require('./config.json');

/**
 * Twitch Helix API helper ("New Twitch API").
 */
class TwitchApi {
  static get requestOptions() {
    // Automatically remove "oauth:" prefix if it's present
    const oauthPrefix = "oauth:";
    let oauthBearer = config.twitch_oauth_token;
    if (oauthBearer.startsWith(oauthPrefix)) {
      oauthBearer = oauthBearer.substr(oauthPrefix.length);
    }
    // Construct default request options
    return {
      baseURL: "https://api.twitch.tv/helix/",
      headers: {
        "Client-ID": config.twitch_client_id,
        "Authorization": `Bearer ${oauthBearer}`
      }
    };
  }

  static handleApiError(err) {
    const res = err.response || { };

    if (res.data && res.data.message) {
      console.error('[TwitchApi]', 'API request failed with Helix error:', res.data.message, `(${res.data.error}/${res.data.status})`);
    } else {
      console.error('[TwitchApi]', 'API request failed with error:', err.message || err);
    }
  }

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
    });
  }

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
  }

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
  }
}

module.exports = TwitchApi;