const Timbot = require('./Timbot');

class Features {
    static get builtin() {
        return [
            "DiscordActivityManager"
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
                Timbot.log.e(_("Feature could not be loaded: {0} {1}\r\n{2}", featureName,
                    (isBuiltIn ? "[Built-in]" : ""), e));

                return false;
            }
        } else {
            // TODO Loading logic for plugins
        }

        // Run the feature's enable script, then mark as enabled
        if (featureObj) {
            Timbot.log.i(_("Feature enabled: {0} {1}", featureName, (isBuiltIn ? "[Built-in]" : "")));

            try {
                if (featureObj.enable) {
                    featureObj.enable();
                }

                this._enabledFeatures[featureName] = featureObj;
                return true;
            } catch (e) {
                Timbot.log.e(_(">>> Error during feature enable script: {0}", e.message));
                return false;
            }
        } else {
            // Fallback if feature failed to be require()'d
            Timbot.log.w(_("Feature was not be loaded: {0} {1}", featureName, (isBuiltIn ? "[Built-in]" : "")));
            return false;
        }
    }

    disableFeature(featureName) {
        if (typeof this._enabledFeatures[featureName] === "undefined" ||  !this._enabledFeatures[featureName]) {
            // Feature was never enabled / already disabled
            return false;
        }

        Timbot.log.i(_("Feature disabled: {0}", featureName));

        // Grab the feature instance and run disable script
        let featureObj = this._enabledFeatures[featureName];

        try {
            if (featureObj.disable) {
                featureObj.disable();
            }
        } catch (e) {
            Timbot.log.e(_(">>> Error during feature disable script: {0}", e.message));
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
}

module.exports = Features;
