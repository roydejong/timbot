const express = require('express');
const Timbot = require('../Core/Timbot');
const ApiClient = require('./ApiClient');
const _package = require('../../package');

/**
 * Manages the Admin Panel API.
 */
class ApiServer {
    /**
     * Initializes the API server with a given config.
     *
     * @param {config} config
     */
    constructor(config) {
        this.config = config;
        this.routes = { };
        this._clientIdGenerator = 0;
        this._clients = { };

        this._autoAuth = !config.admin.password;
    }

    /**
     * Registers an operation handler for the Admin API Websocket.
     *
     * @param {string} opCode - The opcode to subscribe to.
     * @param {function} fnHandler - The handler function for the operation. If the function returns true, it stops the chain of handlers.
     */
    registerApi(opCode, fnHandler) {
        if (typeof this.routes[opCode] === "undefined") {
            this.routes[opCode] = [];
        }

        this.routes[opCode].push(fnHandler);
    }

    /**
     * Unregisters an operation handler from the Admin API Websocket.
     *
     * @param {string} opCode - The opcode to unsubscribe from.
     * @param {function} fnHandler - The handler reference to remove.
     * @returns {boolean} - True if handler was found and removed.
     */
    unregisterApi(opCode, fnHandler) {
        let routeList = this.routes[opCode] || [];
        let fnIdx = routeList.indexOf(fnHandler);

        if (fnIdx >= 0) {
            routeList.splice(fnIdx, 1);
            this.routes[opCode] = routeList;
            return true;
        }

        return false;
    }

    handleIncoming(client, data) {
        let opCode = (data && data.op) || null;

        if (!opCode) {
            try {
                Timbot.log.d(_("[API] Received a message without op header: {0}", JSON.stringify(data)));
            } catch (e) { }

            return;
        }

        let handlerList = this.routes[opCode];

        if (!handlerList || !handlerList.length) {
            Timbot.log.w(_("[API] No handlers registered for op: {0}", opCode));
            return;
        }

        for (let i = 0; i < handlerList.length; i++) {
            let _handlerFn = handlerList[i];

            try {
                let _returnValue = _handlerFn(client, data);

                if (_returnValue === true) {
                    break;
                }
            } catch (e) {
                Timbot.log.e(_("[API] Error occurred in a route handler ({0}): {1}", opCode, e));
                Timbot.log.e(e);
            }
        }
    }

    _handleWebsocketConnect(ws) {
        let client = new ApiClient(this, ws, this._clientIdGenerator++);
        this._clients[client.id] = client;

        if (this._autoAuth) {
            Timbot.log.w(_("[API] Admin: Anonymous user logged in (password is blank)."));
            client.isAuthenticated = true;
        }

        client.onConnect();
    }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Broadcasts a given message to all connected Admin API clients.
     *
     * @param {object} data - The raw data to be transmitted.
     * @param {boolean} [asJson] - If true, encode `data` using JSON.stringify().
     * @param {boolean} [includeUnauthed] - If true, include unauthenticated clients in broadcast list.
     * @returns {boolean} - Indicates whether broadcast was successful or not.
     */
    broadcast(data, asJson, includeUnauthed) {
        if (!this.ws) {
            return false;
        }

        Object.keys(this._clients).forEach((key) => {
            let client = this._clients[key];

            if (includeUnauthed || client.isAuthenticated) {
                if (asJson) {
                    client.sendAsJson(data);
                } else {
                    client.send(data);
                }
            }
        });

        return true;
    }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Starts the API server; setting up the routes and binding it to the configured port.
     */
    start() {
        let apiPort = this.config.admin.port || ApiServer.API_PORT_DEFAULT;
        let apiBindAddress = this.config.admin.address || "0.0.0.0";

        this.app = express();

        // Configure websockets extension
        this.ws = require('express-ws')(this.app);

        // Configure serving of static assets for admin react app frontend
        this.app.use(express.static('admin/build'));

        // API websocket route
        this.app.get('/', function(req, res, next) {
            res.end();
        });

        this.app.ws('/api', this._handleWebsocketConnect.bind(this));

        // Start listening
        this.server = this.app.listen(apiPort, apiBindAddress)
            .on('error', (err) => {
                Timbot.log.e(_("Admin: Could not listen on {0}:{1}: {2}.", apiBindAddress, apiPort, err));
            });

        Timbot.log.i(_("[API] Admin server listening on {0}:{1}.", apiBindAddress, apiPort));
    }

    stop() {
        if (this.server) {
            try {
                this.server.close();

                Timbot.log.d(_("[API] Server shut down."));
            } catch (e) { }
        }
        
        this.server = null;
        this.ws = null;
        this.app = null;
    }
}

ApiServer.API_PORT_DEFAULT = 4269;

ApiServer.OP_LOGIN = "login";
ApiServer.OP_ADMIN_CONNECT_EVENT = "connect";

module.exports = ApiServer;
