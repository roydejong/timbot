/**
 * Event data for a Trigger.
 */
class TriggerEvent {
    /**
     *
     * @param {string} triggerType - The type (key) of the trigger this event concerns.
     * @param {*} [payload] - Optional payload data.
     */
    constructor(triggerType, payload) {
        this.type = triggerType;
        this.data = payload || null;
    }

    /**
     * Alias for `this.type`.
     *
     * @returns {string}
     */
    get triggerType() {
        return this.type;
    }
}

module.exports = TriggerEvent;
