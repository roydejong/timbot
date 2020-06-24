const ConfigurableBehavior = require('./ConfigurableBehavior');

/**
 * An Action definition:
 * Defines an Action that the bot can take as a result of a Trigger.
 */
class Action extends ConfigurableBehavior {
    /**
     * @param {string} key - Unique key for this action.
     * @param {string} label - Friendly label / title for this action.
     * @param {function} handler - Handler function to be called with TriggerEvent data, should it be triggered.
     * @param {array} [options] - BehaviorOptions to add.
     */
    constructor(key, label, handler, options) {
        super(key, label, options);

        this._handler = handler;
        this._triggerCompat = null;
    }

    /**
     * Enables whitelist mode for trigger compatibility, and sets the list of compatible trigger keys.
     *
     * @param {string} triggerKeys
     */
    setCompatibleTriggers(triggerKeys) {
        this._triggerCompat = triggerKeys;
    }

    /**
     * Gets whether this Action is compatible with a given trigger type.
     *
     * @param {string} triggerType
     * @returns {boolean}
     */
    isCompatibleWithTriggerOfType(triggerType) {
        if (!this._triggerCompat) {
            // Non-whitelist mode (no compat defined)
            return true;
        }

        return this._triggerCompat.indexOf(triggerType) >= 0;
    }

    /**
     * Invokes the handler for this action with the provided event data.
     *
     * @param {TriggerEvent} triggerEvent - The trigger event data.
     */
    handleEvent(triggerEvent) {
        this._handler(triggerEvent);
    }
}

module.exports = Action;
