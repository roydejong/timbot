/**
 * Shared base class between Triggers and Actions.
 */
class ConfigurableBehavior {
    /**
     * Constructs a new BaseBehavior.
     *
     * @param {string} [key] - A unique internal identifier for this item.
     * @param {string} [label] - A friendly description for this item, as shown in the admin.
     * @param {array} [options] - List of BehaviorOptions to set on this behavior.
     */
    constructor(key, label, options) {
        this.key = key;
        this.label = label;
        this.options = [];

        if (options) {
            options.forEach((option) => {
                this.addOption(option);
            });
        }
    }

    /**
     * @param {BehaviorOption} behaviorOption - The option definition to add.
     */
    addOption(behaviorOption) {
        this.options.push(behaviorOption);
    }

    /**
     * Fetches an option definition by its key.
     *
     * @param {string} key - Trigger option field key.
     * @returns {BehaviorOption|null}
     */
    getOption(key) {
        return this.options.find((behaviorOption) => {
            return behaviorOption.key === key;
        });
    }

    /**
     * Validates a data payload against the options available to this trigger.
     *
     * @param {object} payload
     * @returns {boolean|string} - Returns TRUE if valid, otherwise an object that maps field keys to errors.
     */
    validate(payload) {
        if (!payload || typeof payload !== "object") {
            return _("Invalid data.");
        }

        let isValid = true;
        let errors = { };

        this.options.forEach((behaviorOption) => {
            let _userValue = payload[behaviorOption];
            let _valResult = behaviorOption.validate(_userValue);

            if (_valResult !== true) {
                // Validation failed
                isValid = false;
                errors[behaviorOption.key] = _valResult;
            }
        });

        return isValid || errors;
    }

    /**
     * Serializes this definition for the Admin API.
     *
     * @return {object}
     */
    serialize() {
        return {
            key: this.key,
            label: this.label,
            options: this.options.map((option) => {
                return option.serialize();
            })
        };
    }
}

module.exports = ConfigurableBehavior;
