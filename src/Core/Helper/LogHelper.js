/**
 * API helper for logging shortcuts.
 */
class LogHelper {
    /**
     * Initializes the LogHelper.
     *
     * @param {Logger} logger - Winston logger instance.
     */
    constructor(logger) {
        this.logger = logger;
    }

    /**
     * Internal function for logging messages.
     *
     * @param level
     * @param args
     * @private
     */
    _log(level, ...args) {
        if (!level) {
            level = "info";
        }

        this.logger.log({
            level: level,
            message: args
        });
    }

    /**
     * Log message at "debug" level.
     * These messages are not shown in production environments.
     *
     * @param msg
     */
    d(...msg) {
        this._log("debug", msg);
    }

    /**
     * Alias for d().
     *
     * @param msg
     */
    debug(...msg) {
        this.d(...msg);
    }

    /**
     * Log message at "info" level.
     *
     * @param msg
     */
    i(...msg) {
        this._log("info", msg);
    }

    /**
     * Alias for i().
     *
     * @param msg
     */
    info(...msg) {
        this.i(...msg);
    }

    /**
     * Log message at "warn" level.
     *
     * @param msg
     */
    w(...msg) {
        this._log("warn", msg);
    }

    /**
     * Alias for w().
     *
     * @param msg
     */
    warn(...msg) {
        this.w(...msg);
    }

    /**
     * Log message at "error" level.
     *
     * @param msg
     */
    e(...msg) {
        this._log("error", msg);
    }

    /**
     * Alias for e().
     *
     * @param msg
     */
    error(...msg) {
        this.e(...msg);
    }
}

module.exports = LogHelper;
