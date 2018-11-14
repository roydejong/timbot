const express = require('express');
const Timbot = require('../Core/Timbot');
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
     * Emits op data to all registered operation handlers.
     *
     * @param {object} data - The decoded JSON payload
     * @private
     */
    _emitApi(ws, data) {
        let opCode = data.op;

        if (!opCode) {
            try {
                Timbot.log.d(_("[API] Received a message without op header: {0}", JSON.stringify(data)));
            } catch (e) { }

            return;
        }

        let handlerList = this.routes[opCode];

        for (let i = 0; i < handlerList.length; i++) {
            let _handlerFn = handlerList[i];

            try {
                let _returnValue = _handlerFn(ws, data);

                if (_returnValue === true) {
                    break;
                }
            } catch (e) {
                Timbot.log.e(_("[API] Error occurred in a route handler ({0}): {1}", opCode, e));
            }
        }
    }

    /**
     * Broadcasts a given message to all connected Admin API clients.
     *
     * @param {object} data
     * @returns {boolean} - Indicates whether broadcast was successful or not.
     */
    broadcast(data) {
        if (!this.ws) {
            return false;
        }

        // Get a list of connected clients and send mesage to each one
        let aWss = this.ws.getWss('/api');

        aWss.clients.forEach((client) => {
            try {
                client.send(data);
            } catch (e) { }
        });

        return true;
    }

    /**
     * Starts the API server; setting up the routes and binding it to the configured port.
     */
    start() {
        let apiPort = this.config.admin.apiPort || ApiServer.API_PORT_DEFAULT;

        this.app = express();

        // Configure websockets extension
        this.ws = require('express-ws')(this.app);

        // Configure serving of static assets for admin react app frontend
        this.app.use(express.static('admin/build'));

        // API websocket route
        this.app.get('/', function(req, res, next) {
            res.end();
        });

        this.app.ws('/api', (ws, req) => {
            ws.on('message', ((msg) => {
                try {
                    let msgParsed = JSON.parse(msg);

                    if (!msgParsed) {
                        throw new Error('Empty message');
                    }

                    this._emitApi(ws, msgParsed);
                } catch (e) {
                    Timbot.log.d(_("[API] Could not parse incoming message as JSON: {0}", msg.toString()));
                }
            }));

            this._emitApi(ws, {"op": ApiServer.OP_ADMIN_CONNECT_EVENT});
        });

        // Start listening
        this.server = this.app.listen(apiPort, '0.0.0.0')
            .on('error', (err) => {
                Timbot.log.e(_("Admin: Could not listen on *:{0}: {1}.", apiPort, err));
            });

        Timbot.log.i(_("[API] Admin server listening on *:{0}.", apiPort));
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

ApiServer.OP_ADMIN_CONNECT_EVENT = "connect";

module.exports = ApiServer;
