const Bsql3 = require('better-sqlite3');
const Timbot = require('../Core/Timbot');
const DbMigrator = require('./DbMigrator');

/**
 * Timbot sqlite database manager.
 */
class Db {
    /**
     * Initializes a new database manager for a given configuration.
     *
     * @param {config} config - Timbot config
     */
    constructor(config) {
        this.config = config;
    }

    /**
     * Initializes the database connection.
     */
    init() {
        let dbPath = Db.DEFAULT_PATH;

        let dbOptions = {
            memory: false,
            readonly: false,
            fileMustExist: false,
            timeout: 5000
        };

        Timbot.log.i(_("[DB] Using database file: {0}", dbPath));

        this.connection = Bsql3(dbPath, dbOptions);
        this.migrate();
    }

    /**
     * Closes the database connection.
     */
    close() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;

            Timbot.log.d(_("[DB] Closed database file."));
        }
    }

    /**
     * Migrates / upgrades the database as needed.
     *
     * @returns {boolean|*|void}
     */
    migrate() {
        let migrator = new DbMigrator(this);
        let ok = migrator.run();

        if (!ok) {
            Timbot.log.w(_("[DB] Database migration failed; using non upgraded database. Things might break."));
        }

        return ok;
    }

    /**
     * Helper function: Perform an insert or update query based on the data in an object via primary key.
     *
     * This function will generate a prepared statement with bound parameters.
     * You must make sure all keys in the object are safe.
     *
     * @param {string} tableName - The table name to upsert data to.
     * @param {object} data - Contains data to insert or update by column name.
     * @param {string} [primaryKeyName] - Overrides the default primary key name ("id").
     * @param {boolean} [forceInsert] - Forces insert and does not perform update check.
     * @return {bool|number} - Returns FALSE on error, otherwise the inserted/updated ID.
     */
    insertOrUpdate(tableName, data, primaryKeyName, forceInsert) {
        if (!primaryKeyName) {
            primaryKeyName = "id";
        }

        // ---

        let isInserting = false;

        try {
            if (forceInsert === true) {
                // Forcing insert
                isInserting = true;
            } else if (typeof data[primaryKeyName] === "undefined" || !data[primaryKeyName]) {
                // Need to insert, primary key is missing
                isInserting = true;
            } else {
                // May need to insert, a PK is set so let's see if it exists
                let cval = this.connection
                    .prepare(`SELECT COUNT(*) AS cval FROM "${tableName}" WHERE "${primaryKeyName}" = ?;`)
                    .get(data[primaryKeyName]).cval;

                if (!cval || parseInt(cval) === 0) {
                    // Need to insert, no hit for PK
                    isInserting = true;
                }
            }
        } catch (e) {
            Timbot.log.e(_("[DB] Could not determine insert/update mode: {0}", e.message));
            return false;
        }

        // ---

        if (isInserting) {
            // Insert mode
            return this.insert(tableName, data);
        } else {
            // Update mode
            if (this.update(tableName, data, primaryKeyName)) {
                return data[primaryKeyName];
            }

            return false;
        }
    }

    /**
     * Helper function: Insert data from an object into a table.
     * Generates a prepared statement with bound parameters.
     *
     * Security note: You must verify that the object keys are safe.
     *
     * @param {string} tableName - Name of the table to insert to.
     * @param {object} data - Object containing data keyed by column name.
     * @return {bool|number} - Returns FALSE on error, otherwise the inserted ID.
     */
    insert(tableName, data) {
        try {
            let sKeyList = "";
            let sValueList = "";
            let boundParams = [];

            let _first = true;

            Object.keys(data).forEach((key) => {
                if (data.hasOwnProperty(key)) {
                    if (_first) {
                        _first = false;
                    } else {
                        sKeyList += ", ";
                        sValueList += ", ";
                    }

                    sKeyList += "`" + key + "`";
                    sValueList += "@" + key;

                    boundParams.push(data[key]);
                }
            });

            let sQuery = `INSERT INTO ${tableName} (${sKeyList}) VALUES (${sValueList});`;
            Timbot.log.d(_("[DB] Generated insert query: {0}", sQuery));

            let info = this.connection
                .prepare(sQuery)
                .run(data);

            return parseInt(info.lastInsertRowid);
        } catch (e) {
            Timbot.log.e(_("[DB] Unable to generate/run update query: {0}", e.message));
            return false;
        }
    }

    /**
     * Helper function: Update data from an object into a table, for an existing record, based on PK.
     * Generates a prepared statement with bound parameters.
     *
     * Security note: You must verify that the object keys are safe.
     *
     * @param {string} tableName - Name of the table to update in.
     * @param {object} data - Object containing data keyed by column name.
     * @param {string} primaryKeyName - The name of the primary key.
     * @returns {bool} - True on success, false on error or if no rows were affected.
     */
    update(tableName, data, primaryKeyName) {
        let pkValue = data[primaryKeyName];

        if (!pkValue) {
            Timbot.log.e(_("[DB] Can't run update without valid primary key ({0}, {1})", tableName, primaryKeyName));
            return false;
        }

        try {
            // UPDATE `table_name` SET
            let sQuery = 'UPDATE `' + tableName + '` SET ';
            let _first = true;

            Object.keys(data).forEach((key) => {
                if (data.hasOwnProperty(key)) {
                    if (_first) {
                        _first = false;
                    } else {
                        sQuery += ", ";
                    }

                    // `column_name` = @column_name
                    sQuery += '`' + key + '` = @' + key;
                }
            });

            // WHERE `pk_name` = @pk_name
            sQuery += ' WHERE `' + primaryKeyName + '` = @' + primaryKeyName + ' LIMIT 1;';

            Timbot.log.d(_("[DB] Generated update query: {0}", sQuery));

            let info = this.connection
                .prepare(sQuery)
                .run(data);

            return info.changes >= 1;
        } catch (e) {
            Timbot.log.e(_("[DB] Unable to generate/run update query: {0}", e.message));
            return false;
        }
    }

    /**
     * Performs a simple delete by primary key (single entry).
     *
     * @param {string} tableName - The name of the table to delete an entry from. Unsafe.
     * @param {string|number} primaryKeyValue - The value of the primary key to delete. Will be bound as parameter.
     * @param {string} [primaryKeyName] - Optional override for primary key name. Defaults to id. Unsafe.
     */
    deleteIfExists(tableName, primaryKeyValue, primaryKeyName) {
        if (!primaryKeyName) {
            primaryKeyName = "id";
        }

        try {
            let sQuery = "DELETE FROM `" + tableName + "` WHERE `" + primaryKeyName + "` = @pkval LIMIT 1;";

            let queryParams = {
                pkval: primaryKeyValue
            };

            Timbot.log.d(_("[DB] Generated delete query: {0}", sQuery));

            let info = this.connection
                .prepare(sQuery)
                .run(queryParams);

            return info.changes >= 0;
        } catch (e) {
            Timbot.log.e(_("[DB] Unable to generate/run delete query: {0}", e.message));
            return false;
        }
    }
}

Db.DEFAULT_PATH = "data/timbot.db";

module.exports = Db;
