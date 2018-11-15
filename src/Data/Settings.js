const Timbot = require('../Core/Timbot');

/**
 * Utility class for working with the "settings" table in the database.
 */
class Settings {
    /**
     * @param {Db} db - The database instance to manage settings for.
     */
    constructor (db) {
        this._connection = db.connection;

        this._settings = { };
        this._dirtySettings = [];
        this._newSettings = [];
    }

    /**
     * Loads all settings from the database.
     *
     * @returns {boolean} - Success state.
     */
    load() {
        try {
            let dbSettings = this._connection.prepare("SELECT `key`, `value` FROM settings;").all();

            dbSettings.forEach((row) => {
                this._settings[row.key] = row.value;
            });

            this._newSettings = [];
            this._dirtySettings = [];

            return true;
        } catch (e) {
            Timbot.log.e(_("[Settings] Could not load settings table from database: {0}", e.message));
            return false;
        }
    }

    /**
     * Writes any new or updated settings to the database.
     *
     * @returns {boolean} - Success state.
     */
    save() {
        try {
            // Create new settings
            this._newSettings.forEach((key) => {
                let value = this._settings[key];
                this._connection.prepare("INSERT INTO `settings` (`key`, `value`) VALUES (?, ?);").run(key, value);
                Timbot.log.d(_("[Settings] Created setting: `{0}` -> `{1}`", key, value));
            });

            // Update changed settings
            this._dirtySettings.forEach((key) => {
                let value = this._settings[key];
                this._connection.prepare("UPDATE `settings` SET `value` = ? WHERE `key` = ? LIMIT 1;").run(value, key);
                Timbot.log.d(_("[Settings] Updated setting: `{0}` -> `{1}`", key, value));
            });

            // Flush change lists
            this._newSettings = [];
            this._dirtySettings = [];

            return true;
        } catch (e) {
            Timbot.log.e(_("[Settings] Could not write settings changes to database: {0}", e.message));
            return false;
        }
    }

    /**
     * Sets a value in the "settings" table, causing an entry to be updated or created.
     * Does NOT automatically commit to database, unless `autoSave` is used. Otherwise, call save() manually.
     *
     * @param {string} key - The setting ID to update or create.
     * @param {any} value - The value to set.
     * @param {boolean} autoSave - If true, write to database immediately.
     */
    set(key, value, autoSave) {
        let rowMarkedAsNew = this._newSettings.indexOf(key) >= 0;
        let rowMarkedAsChanged = this._dirtySettings.indexOf(key) >= 0;
        let rowExists = Object.keys(this._settings).indexOf(key) >= 0;

        this._settings[key] = value;

        if (rowMarkedAsNew || rowMarkedAsChanged) {
            // Row is already marked
        } else if (!rowExists) {
            // Row is new
            this._newSettings.push(key);
        } else {
            // Row is updated
            this._dirtySettings.push(key);
        }

        if (autoSave) {
            this.save();
        }
    }

    /**
     * Retrieves a setting value from the "settings" table.
     *
     * @param {string} key - The setting ID to retrieve.
     * @param defaultValue
     * @returns {*|null}
     */
    get(key, defaultValue) {
        defaultValue = (typeof defaultValue === "undefined" ? null : defaultValue);
        return this._settings[key] || defaultValue;
    }
}

module.exports = Settings;
