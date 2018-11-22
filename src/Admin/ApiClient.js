const Timbot = require('../Core/Timbot');

class ApiClient {
    constructor(server, ws, id) {
        this.server = server;
        this.ws = ws;
        this.id = id;

        /**
         * @type {boolean} - Tracks whether this client has authenticated with the admin password or not.
         */
        this.isAuthenticated = false;
    }

    send(data) {
        try {
            return this.ws.send(data);
        } catch (e) {
            Timbot.log.d(_("[API] Failed to send an outgoing message: {0}", e.message));
            return false;
        }
    }

    sendAsJson(data) {
        return this.send(JSON.stringify(data));
    }

    onConnect() {
        this.ws.on('message', this._handleMessage.bind(this));

        if (!this.isAuthenticated) {
            // Must auth before we trust this connection
            this.sendAsJson({op: "must_login"});
        } else {
            // Connection is already authed / trusted, emit login event
            this.afterLogin();
        }
    }

    afterLogin() {
        this.isAuthenticated = true;
        this.sendAsJson({op: "login", ok: true});
        this.server.handleIncoming(this, {"op": "connect"});
    }

    _handleMessage(msg) {
        // Incoming API message for this client: First, try parsing it. It should be valid JSON.
        let msgParsed = null;

        try {
            msgParsed = JSON.parse(msg);
        } catch (e) {
            Timbot.log.d(_("[API] Could not parse incoming message as JSON: {0}", msg.toString()));
            return;
        }

        // If parsing was OK, process them message
        if (msgParsed) {
            if (msgParsed.op === "login") {
                // User is trying to log in, we need to handle this ourselves
                this._handleLogin(msgParsed);
                return;
            }

            if (!this.isAuthenticated) {
                // User is trying to send a non-log in message but is not authed
                // Reject message and advise
                Timbot.log.d(_("[API] Rejected unauthed API message for op `{0}`", msgParsed.op || "unknown"));
                this.sendAsJson({op: "must_login"});
                return;
            }

            try {
                // Generic message, defer to admin API router (which will delegate it down to some Feature maybe)
                this.server.handleIncoming(this, msgParsed);
            } catch (e) {
                Timbot.log.d(_("[API] Error processing {1} event: {0}", e.message, msgParsed.op || "unknown"));
            }
        }
    }

    _handleLogin(loginMsg) {
        if (this._processingLogin) {
            return;
        }

        if (this.isAuthenticated) {
            this.sendAsJson({op: "login", ok: true});
            return;
        }

        this._processingLogin = true;

        setTimeout(() => {
            let password = loginMsg.password || "";

            if (password === this.server.config.admin.password) {
                this.isAuthenticated = true;

                Timbot.log.i(_("[API] User logged in to admin panel."));

                this.afterLogin();
            } else {
                Timbot.log.w(_("[API] Rejected log in to admin panel with invalid password."));
                this.sendAsJson({op: "login", ok: false});
            }

            this._processingLogin = false;
        }, 1000);
    }
}

module.exports = ApiClient;
