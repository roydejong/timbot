const Timbot = require('../Core/Timbot');

class Messenger {
    constructor() {
        this._filters = [];
    }

    handleDiscordMessage(client, message) {
        let isStopped = false;

        this._filters.forEach((fnFilter) => {
            try {
                if (isStopped) {
                    return;
                }

                let result = fnFilter(client, message);

                if (result === false) {
                    isStopped = true;
                }
            } catch (e) {
                Timbot.log.e(_("[Messenger] Incoming message filter failed: {0}.", e));
            }
        });
    }

    registerFilter(filter) {
        this._filters.push(filter);
    }

    unregisterFilter(filter) {
        let filterIdx = this._filters.indexOf(filter);

        if (filterIdx >= 0) {
            this._filters.splice(filterIdx, 1);
        }
    }
}

module.exports = Messenger;
