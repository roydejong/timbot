const Timbot = require('./Timbot');

class Features {
    static get builtin() {
        return [
            "DiscordActivityManager",
            "TimbotInfo"
        ];
    };

    constructor() {
        this._enabledFeatures = { };
    }

    enableFeature(featureName) {
        // Check if feature is already enabled
        if (Object.keys(this._enabledFeatures).indexOf(featureName) >= 0) {
            return false;
        }

        // Load the feature
        let isBuiltIn = Features.builtin.indexOf(featureName) >= 0;
        let featureObj = null;

        if (isBuiltIn) {
            try {
                featureObj = new (require(`../Features/${featureName}`));
            } catch (e) {
                Timbot.log.e(_("[Features] Failed to load built-in feature {0}: {1}", featureName, e.message));

                return false;
            }
        } else {
            // TODO Loading logic for plugins
        }

        // Run the feature's enable script, then mark as enabled
        if (featureObj) {
            Timbot.log.i(_("[Features] Enabled: {0} {1}", featureName, (isBuiltIn ? "[Built-in]" : "")));

            try {
                if (featureObj.enable) {
                    featureObj.enable();
                }

                this._enabledFeatures[featureName] = featureObj;
                return true;
            } catch (e) {
                Timbot.log.e(_("[Features] >>> Error during feature enable script: {0}", e.message));
                return false;
            }
        } else {
            // Fallback if feature failed to be require()'d
            Timbot.log.w(_("[Features] Could not load {0} {1}", featureName, (isBuiltIn ? "[Built-in]" : "")));
            return false;
        }
    }

    emitEvent(eventName, data) {
        Object.keys(this._enabledFeatures).forEach((key) => {
            if (this._enabledFeatures.hasOwnProperty(key)) {
                /**
                 * @var featureObj {Feature}
                 */
                let featureObj = this._enabledFeatures[key];

                if (featureObj) {
                    try {
                        featureObj.handleEvent(eventName, data);
                    } catch (e) {
                        Timbot.log.e(_("[Features] Event handler {0} failed for feature {1}: {2}", eventName, key, e.message));
                    }
                }
            }
        });
    }

    disableFeature(featureName) {
        if (typeof this._enabledFeatures[featureName] === "undefined" ||  !this._enabledFeatures[featureName]) {
            // Feature was never enabled / already disabled
            return false;
        }

        Timbot.log.d(_("[Features] Feature disabled: {0}", featureName));

        // Grab the feature instance and run disable script
        /**
         * @var featureObj {Feature}
         */
        let featureObj = this._enabledFeatures[featureName];

        try {
            featureObj.disable();
        } catch (e) {
            Timbot.log.e(_("[Features] >>> Error during feature disable script: {0}", e.message));
            return false;
        }

        // Mark as disabled
        delete this._enabledFeatures[featureName];
        return true;
    }

    start() {
        // Load built-in features
        Features.builtin.forEach((featureName) => {
            this.enableFeature(featureName);
        });
    }

    shutdown() {
        // Disable all features
        Object.keys(this._enabledFeatures).forEach((featureName) => {
            this.disableFeature(featureName);
        });
    }
}

module.exports = Features;

