/**
 * Base class for all Features.
 */
class Feature {
    /**
     * Enables the feature or turns it on.
     * This function is responsible for initialization and startup logic.
     *
     * @abstract
     * @public
     */
    enable() {
        // ...
    }

    /**
     * Disables the feature or turns it off.
     * This function is responsible for clean up and shut down logic.
     *
     * @abstract
     * @public
     */
    disable() {
        // ...
    }

    /**
     * Handles an event that was broadcast to all features.
     * Used to handle major changes, e.g. connecting or disconnecting from Discord.
     *
     * @param {string} eventName - The name of the event that was broadcast. See Feature.EVENT_* constants.
     * @param {object} data - Event-specific data object.
     */
    handleEvent(eventName, data) {
        // ...
    }
}

Feature.EVENT_DISCORD_READY = "discord_ready";
Feature.EVENT_DISCORD_DISCONNECTED = "discord_disconnected";

module.exports = Feature;
