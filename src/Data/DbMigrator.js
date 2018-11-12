const Timbot = require('../Core/Timbot');
const fs = require('fs');
const path = require('path');

/**
 * Utility for performing database migrations / upgrades.
 * Part of the self-update system for Timbot.
 */
class DbMigrator {
    /**
     * @param {Db} db - The database manager instance.
     */
    constructor(db) {
        this.db = db;
        this.connection = db.connection;
    }

    run() {
        let dbVersion = null;

        // Attempt to determine the current migration version
        try {
            dbVersion = parseInt(this.connection
                .prepare('SELECT `value` FROM `settings` WHERE `key` = ? LIMIT 1')
                .get("db_version")
                .value);

            Timbot.log.d(_("[DB] Detected database version: {0}", dbVersion));
        } catch (e) {
            if (e.message.indexOf("no such table") >= 0) {
                // Table does not exist, assume database version zero
                Timbot.log.d(_("[DB] Settings table does not exist, creating new database."));
                dbVersion = 0;
            } else {
                // Some kind of read/write error
                Timbot.log.e(_("[DB] An error occurred while trying to detect database version: {0}", e.message));
                return false;
            }
        }

        // Run whatever migrations need running
        let availableMigrations = this.loadAvailableMigrations();

        let migrationTopVersion = dbVersion || 0;
        let migrationFailed = false;
        let migrationsDidComplete = false;

        Timbot.log.d(_("[DB] Discovered {0} available migrations", Object.keys(availableMigrations).length));

        Object.keys(availableMigrations).sort().forEach((fileName) => {
            if (migrationFailed) {
                return;
            }

            let filenameNoExt = fileName.split('.', 2)[0];
            let migrationParts = filenameNoExt.split('_', 2);
            let migrationVersion = parseInt(migrationParts[0]);

            if (migrationVersion > migrationTopVersion) {
                let sqlPath = availableMigrations[fileName];

                try {
                    this.connection.exec(fs.readFileSync(sqlPath, 'utf8'));
                } catch (e) {
                    migrationFailed = false;

                    Timbot.log.e(_("[DB] >>> Migration failed: {{0}} {1}: {2}", migrationParts[0],
                        migrationParts[1], e.message));

                    return;
                }

                migrationTopVersion = migrationVersion;
                migrationsDidComplete = true;

                Timbot.log.i(_("[DB] >>> Migrate: {{0}} {1}", migrationParts[0], migrationParts[1]));
            } else {
                Timbot.log.d(_("[DB] >>> Not migrating: {{0}} {1}", migrationParts[0], migrationParts[1]));
            }
        });

        // Update database version
        if (migrationsDidComplete) {
            try {
                this.connection
                    .prepare("UPDATE `settings` SET `value` = ? WHERE `key` = ? LIMIT 1;")
                    .run(migrationTopVersion, "db_version");

                Timbot.log.i(_("[DB] Database has been migrated to version {0}.", migrationTopVersion));
            } catch (e) {
                Timbot.log.e(_("[DB] >>> Could not write database version: {0}", e.message));
                return false;
            }
        } else {
            // No migrations complete, either a total failure or already up-to-date
            return !migrationFailed;
        }
    }

    /**
     * Loads all available migrations.
     *
     * @return {object} - Index of migration files.
     */
    loadAvailableMigrations() {
        let dir = this.getMigrationsPath();
        let migrations = {};

        fs.readdirSync(dir).forEach((filename) => {
            migrations[filename] = path.join(dir, `/${filename}`);
        });

        return migrations;
    }

    /**
     * Get the path for the database migration files.
     *
     * @returns {string}
     */
    getMigrationsPath() {
        return path.join(__dirname, '/Migrations');
    }
}

module.exports = DbMigrator;
