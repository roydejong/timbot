const Twitter = require('twitter');
const SimpleDb = require('simple-node-db');

class TwitterMonitor {
    /**
     * @param {string} apiKey Consumer API Key
     * @param {string} apiSecret Consumer Secret Key
     * @param {array} accountsList List of Twitter account names to monitor.
     */
    constructor(apiKey, apiSecret, accessToken, accessTokenSecret, accountsList) {
        this.accountsList = accountsList;

        let clientConfig = {
            consumer_key: apiKey,
            consumer_secret: apiSecret,
            access_token_key: accessToken,
            access_token_secret: accessTokenSecret
        };

        this.client = new Twitter(clientConfig);

        this.db = new SimpleDb('data/twitter-monitor');

        this.callbacks = [];
    }

    /**
     * Registers a new callback to receive new tweet events.
     * Callback receives the Twitter Tweet object.
     *
     * @param {function} callback
     */
    onNewTweet(callback) {
        this.callbacks.push(callback);
    }

    /**
     * Helper function: Fire all "new tweet" callbacks.
     *
     * @param tweet
     * @private
     */
    _fireOnNewTweet(tweet) {
        for (let i = 0; i < this.callbacks.length; i++) {
            this.callbacks[i](tweet);
        }
    }

    /**
     * Starts monitoring the selected twitter accounts.
     */
    start() {
        setInterval(this.refresh.bind(this), TwitterMonitor.CHECK_INTERVAL_MS);
        this.refresh();
    }

    /**
     * Refreshes the timelines for the monitored accounts, checking for new tweets.
     */
    refresh() {
        for (let i = 0; i < this.accountsList.length; i++) {
            let screenName = this.accountsList[i];

            let fnRefreshUser = (dbRecord) => {
                let params = {
                    screen_name: screenName,
                    count: 1
                };

                this.client.get('statuses/user_timeline', params, (error, tweets, response) => {
                    if (error) {
                        console.error('[TwitterMonitor]', `Could not fetch tweets for ${screenName}:`, error);
                        return;
                    }

                    let topTweet = tweets[0] || null;

                    if (topTweet && topTweet.id > dbRecord.lastTweetId) {
                        let didError = false;

                        try {
                            console.log('[TwitterMonitor]', `New tweet found for ${screenName}: #${topTweet.id} / ${topTweet.text}`);
                            this._fireOnNewTweet(topTweet);
                        } catch (e) {
                            didError = true;
                            console.error('[TwitterMonitor]', 'Error in callback (tweet not broadcast?)', e);
                        }

                        if (!didError) {
                            dbRecord.lastTweetId = topTweet.id;
                            this.db.update(dbRecord.key, dbRecord, (err) => {
                                if (err) {
                                    console.error('[TwitterMonitor]', 'Error during database update:', err);
                                }
                            });
                        }
                    }
                });
            };

            // Grab the last tweet that we saw from this user
            let databaseKey = this.db.createDomainKey('user', screenName);

            this.db.find(databaseKey, (err, model) => {
                if (err || !model) {
                    // The user does not exist in the database yet, insert now
                    model = {
                        id: screenName,
                        lastTweetId: null,
                        key: databaseKey
                    };

                    this.db.insert(databaseKey, model, () => {
                        fnRefreshUser(model);
                    });
                } else {
                    // The user exists and we now have the record
                    fnRefreshUser(model);
                }
            });
        }
    }
}

TwitterMonitor.CHECK_INTERVAL_MS = 15 * 60 * 1000;

module.exports = TwitterMonitor;
