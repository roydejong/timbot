/**
 * Behavior record model.
 * Combines a Trigger with one or more Actions.
 */
class Behavior {
    /**
     * @param {object} [row] - Database row / object with values (`behaviors` row).
     * @param {array} [actionRows] - Database rows containing actions for this behavior (`behavior_actions` rows).
     * @param {array} [optionRows] - Database rows containing options for this behavior (`behavior_options` rows).
     */
    constructor(row, actionRows, optionRows) {
        this.id = null;

        this.triggerType = null;
        this.triggerConfig = { };

        this.isEnabled = false;

        this.actions = { };

        // Fill this from database records if they were passed in to the constructor
        if (row) {
            this.fillFromReactionRow(row);

            if (actionRows) {
                this.fillActionsFromRows(actionRows);
            }

            if (optionRows) {
                this.fillOptionsFromRows(optionRows);
            }
        }

        console.log(this, 'loaded behavior');
    }

    /**
     * @param {TriggerEvent} triggerEvent - Generic incoming event for our trigger.
     */
    handleEvent(triggerEvent) {
        Object.values(this.actions).forEach((actionDef) => {
            try {
                let actionRef = Timbot.behavior.getAction(actionDef.type);
                actionRef.handleEvent(triggerEvent, actionDef.config);
            } catch (e) {
                Timbot.log.e(_("[Behavior] Error in trigger event ({1}) action execution ({2}): {0}",
                    e.message, triggerEvent.triggerType, actionDef.type));
            }
        });
    }

    fillFromReactionRow(row) {
        this.id = row.id || null;
        this.triggerType = row.trigger_type || null;
        this.isEnabled = row.is_enabled || null;
    }

    fillActionsFromRows(rows) {
        rows.forEach((behaviorActionRow) => {
            this.actions.push({
                type: behaviorActionRow.action_type,
                config: { }
            });
        });
    }

    fillOptionsFromRows(rows) {
        this.triggerConfig = { };

        rows.forEach((behaviorOption) => {
            if (!behaviorOption.action_type) {
                // No "action_type" value: this row is trigger config
                this.triggerConfig[behaviorOption.option_key] = behaviorOption.option_value;
            } else {
                // Has "action_type" value: this row is config for a specific action
                let actionData = this.actions[behaviorOption.action_type];

                if (actionData) {
                    let configObj = this.actions[behaviorOption.action_type].config;
                    configObj[behaviorOption.option_key] = behaviorOption.option_value;
                }
            }
        });
    }

    get trigger() {
        return Timbot.behavior.getTrigger(this.triggerType);
    }
}

module.exports = Behavior;
