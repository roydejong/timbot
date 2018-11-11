const express = require('express');
const Timbot = require('../Core/Timbot');
const _package = require('../../package');

class ApiServer {
    constructor(config) {
        this.config = config;
    }

    start() {
        let apiPort = this.config.admin.apiPort || ApiServer.API_PORT_DEFAULT;

        this.app = express();

        // Configure websockets extension
        const expressWs = require('express-ws')(this.app);

        // Configure serving of static assets for admin react app frontend
        this.app.use(express.static('admin/build'));

        // API websocket route
        this.app.get('/', function(req, res, next) {
            res.end();
        });

        this.app.ws('/api', (ws, req) => {
            ws.on('message', function(msg) {
                console.log(msg);
            });
            console.log('socket', req.testing);
        });

        // Start listening
        this.app.listen(apiPort, '0.0.0.0')
            .on('error', (err) => {
                Timbot.log.e(_("Admin: Could not listen on *:{0}: {1}.", apiPort, err));
            });

        Timbot.log.i(_("Admin: API server listening on *:{0}.", apiPort));
    }
}

ApiServer.API_PORT_DEFAULT = 4269;

module.exports = ApiServer;
