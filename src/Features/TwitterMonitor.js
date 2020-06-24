const Feature = require('./Base/Feature');
const Timbot = require('../Core/Timbot');
const Twitter = require('twitter');
const Trigger = require('../Behavior/Trigger');
const BehaviorOption = require('../Behavior/BehaviorOption');

class TwitterMonitor extends Feature {
    /**
     * @inheritDoc
     */
    enable() {
        // Validate config
        let twitterConfig = Timbot.config.twitter || null;

        if (!twitterConfig || !twitterConfig.api_key) {
            return false;
        }

        if (!twitterConfig.api_secret  || !twitterConfig.access_token || !twitterConfig.access_token_secret) {
            Timbot.log.w("[Twitter] Twitter integration config is incomplete. Must set all four keys/tokens.");
            return false;
        }

        // Init Twitter API client
        this.twitter = new Twitter({
            consumer_key: twitterConfig.api_key,
            consumer_secret: twitterConfig.api_secret,
            access_token_key: twitterConfig.access_token,
            access_token_secret: twitterConfig.access_token_secret
        });

        // Register integration trigger
        Timbot.behavior.registerTrigger(new Trigger("twitter_tweet", "Twitter: New tweet from an account", [
            new BehaviorOption("handle", BehaviorOption.TYPE_STRING, "Twitter handle", true)
        ]));

        // Update and apply list of accounts to watch
        this.reloadMonitors();

        // Start monitor
        this._monitorInterval = setInterval(this._tick, TwitterMonitor.CHECK_INTERVAL_MS);
    }

    /**
     * @inheritDoc
     */
    disable() {
        // Stop monitoring
        if (this._monitorInterval) {
            clearInterval(this._monitorInterval);
            this._monitorInterval = null;
        }

        // Clear data and refs
        this.twitter = null;

        // Unregister integration trigger
        Timbot.behavior.unregisterTrigger("twitter_tweet");
    }

    /**
     * @inheritDoc
     */
    handleEvent() {

    }

    // -----------------------------------------------------------------------------------------------------------------

    reloadMonitors() {

    }

    // -----------------------------------------------------------------------------------------------------------------

    _tick() {

    }
}

TwitterMonitor.CHECK_INTERVAL_MS = 15 * 60 * 1000;

module.exports = TwitterMonitor;
