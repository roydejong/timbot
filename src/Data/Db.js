const Bsql3 = require('better-sqlite3');
const Timbot = require('../Core/Timbot');
const DbMigrator = require('./DbMigrator');

class Db {
    constructor(config) {
        this.config = config;
    }

    init() {
        let dbPath = this.getPath();
        let dbOptions = this.getOptions();

        Timbot.log.i(_("[DB] Using database file: {0}", dbPath));

        this.connection = Bsql3(dbPath, dbOptions);
        this.migrate();
    }

    close() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;

            Timbot.log.d(_("[DB] Closed database file."));
        }
    }

    migrate() {
        let migrator = new DbMigrator(this);
        let ok = migrator.run();

        if (!ok) {
            Timbot.log.w(_("[DB] Database migration failed; using non upgraded database. Things might break."));
        }

        return ok;
    }

    getPath() {
        return Db.DEFAULT_PATH;
    }

    getOptions() {
        return {
            memory: false,
            readonly: false,
            fileMustExist: false,
            timeout: 5000
        };
    }
}

Db.DEFAULT_PATH = "data/timbot.db";

module.exports = Db;
