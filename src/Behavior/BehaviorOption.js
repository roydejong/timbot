/**
 * Generic behavior option field definition, associated with a Trigger or Action.
 */
class BehaviorOption {
    /**
     * Constructs a new generic behavior option field for a Trigger or an Action.
     *
     * @param {string} key - The unique key for the option.
     * @param {string} [type] - The field type, see BehaviorOption.TYPES. Defaults to "string" (text).
     * @param {string} [label] - The field label, as shown in the admin. Defaults to the field key if left blank.
     * @param {boolean} [required] - If true, the field cannot be left blank (for booleans: must be checked).
     */
    constructor(key, type, label, required) {
        this.key = key;
        this.type = type || BehaviorOption.TYPE_STRING;
        this.label = label || key;

        this._validators = [];

        if (this._required = required || false) {
            this.addValidator(BehaviorOption.validateNotEmpty, _("This field is required."));
        }
    }

    /**
     * Adds a validation function to this option field.
     *
     * @param {function} fnValidator - The validator function that will be called with the user input. Must return bool.
     * @param {string} errorMessage - The error message to show, if the validator fails.
     */
    addValidator(fnValidator, errorMessage) {
        this._validators.push({
            fn: fnValidator,
            errorMessage: errorMessage || _("Unknown field validation error.")
        });
    }

    /**
     * Validates a given field value against this behavior option's settings and validation rules.
     *
     * @param {*} value - The value to validate.
     * @returns {boolean|string} - Returns TRUE if validation passes, otherwise a string error message.
     */
    validate(value) {
        let isValid = true;
        let errorMessage = "";

        this._validators.forEach((validator) => {
            if (!isValid) {
                // Already failed somewhere in the chain.
                return;
            }

            if (validator.fn(value) !== true) {
                // Validation did not explicitly return true, so assume it has failed.
                isValid = false;
                errorMessage = validator.errorMessage;
            }
        });

        return isValid || errorMessage;
    }

    /**
     * Serializes this field data for the Admin API.
     *
     * @return {object}
     */
    serialize() {
        return {
            key: this.key,
            type: this.type,
            label: this.label,
            required: this._required
        };
    }
}

BehaviorOption.TYPE_BOOLEAN = "boolean";
BehaviorOption.TYPE_STRING = "string";

BehaviorOption.TYPES = { };
BehaviorOption.TYPES[BehaviorOption.TYPE_BOOLEAN] = _("Checkbox");
BehaviorOption.TYPES[BehaviorOption.TYPE_STRING] = _("Text");

BehaviorOption.validateNotEmpty = (value) => {
    return !!value;
};

module.exports = BehaviorOption;
