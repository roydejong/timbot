const Timbot = require('../Core/Timbot');
const Behavior = require('./Behavior');

/**
 * The nerve center for triggers and actions.
 */
class BehaviorBrain {
    /**
     * Constructs a new, blank brain.
     */
    constructor() {
        this.triggers = { };
        this.actions = { };
        this.behaviors = { };
    }

    /**
     * Loads all behavior entries from the database.
     *
     * @returns {boolean}
     */
    load() {
        let db = Timbot.db.connection;
        let i = 0;

        try {
            db.prepare("SELECT * FROM behaviors;").all().forEach((row) => {
                let actionRows = db.prepare("SELECT * FROM behavior_actions WHERE behavior_id = @bi;").run({bi: row.id});
                let optionRows = db.prepare("SELECT * FROM behavior_options WHERE behavior_id = @bi;").run({bi: row.id});

                let behavior = new Behavior(row, actionRows, optionRows);
                this.behaviors[behavior.id] = behavior;

                i++;
            });
        } catch (e) {
            Timbot.log.e(_("[Behavior] Could not load behavior config from database: {0}", e.message));
            return false;
        }

        Timbot.log.i(_("[Behavior] Loaded {0} behaviors.", i));
        return true;
    }

    /**
     * Emits a trigger event, causing all behaviors with that trigger to run their associated actions.
     *
     * @param {TriggerEvent} triggerEvent - Trigger event data.
     */
    emitTrigger(triggerEvent) {
        try {
            // Get subset of behaviors with this trigger type
            let behaviorsWithTrigger = Object.values(this.behaviors).filter((behavior) => {
                return behavior.triggerType === triggerEvent.triggerType;
            });

            // Emit the event to each qualifying trigger
            behaviorsWithTrigger.forEach(() => {
                behavior.handleEvent(triggerEvent);
            });
        } catch (e) {
            Timbot.log.e(_("[Behavior] Error in trigger event ({1}) emission: {0}", e.message, triggerEvent.triggerType));
        }
    }

    /**
     * Register a Trigger definition.
     *
     * @param {Trigger} trigger - Trigger to add.
     */
    registerTrigger(trigger) {
        this.triggers[trigger.key] = trigger;
    }

    /**
     * Find trigger by its key.
     *
     * @param {string} triggerKey
     * @returns {object|null}
     */
    getTrigger(triggerKey) {
        return this.triggers.find(triggerKey);
    }

    /**
     * Unregister a Trigger definition.
     *
     * @param {string} triggerKey - Key of trigger to remove.
     */
    unregisterTrigger(triggerKey) {
        delete this.triggers[triggerKey];
    }

    /**
     * Register a Action definition.
     *
     * @param {Action} action - Action to add.
     */
    registerAction(action) {
        this.actions[action.key] = action;
    }

    /**
     * Find action by its key.
     *
     * @param {string} actionKey
     * @returns {object|null}
     */
    getAction(actionKey) {
        return this.actions.find(actionKey);
    }

    /**
     * Unregister an Action definition.
     *
     * @param {string} actionKey - Key of action to remove.
     */
    unregisterAction(actionKey) {
        delete this.actions[actionKey];
    }

    /**
     * Serialize behavior config data for the Admin API.
     *
     * @returns {object}
     */
    serializeConfig() {
        return {
            triggers: Object.values(this.triggers).map((trigger) => { return trigger.serialize() }),
            actions: Object.values(this.actions).map((action) => { return action.serialize() })
        }
    }
}

module.exports = BehaviorBrain;
