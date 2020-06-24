export default class ApiClient {
    static init(wsUrl) {
        this.wsUrl = wsUrl;

        this.retrySecs = 3;

        this.subscriptions = {};
        this.greedyCache = { };

        this.open();
    }

    static open() {
        if (this.ws) {
            try {
                this.ws.close();
            } catch (e) { }

            this.ws = null;
        }

        this.ws = new WebSocket(this.wsUrl);

        console.info('[API]', `⏳ Connecting to ${this.wsUrl}...`);

        this.ws.addEventListener('open', () => {
            console.info('[API]', '✅ Websocket connected!');
            this.retrySecs = 3;
            this.emit(ApiClient.EVENT_TYPE_CONNECTED, null, false);
        });

        this.ws.addEventListener('message', (msg) => {
            console.debug('[API]', 'Websocket message:', msg.data);
            ApiClient.handleIncoming(msg.data);
        });

        this.ws.addEventListener('close', () => {
            console.warn('[API]', '⚠ Websocket closed.');
            this.scheduleRetry();
            this.emit(ApiClient.EVENT_TYPE_DISCONNECTED, null, false);
        });

        this.ws.addEventListener('error', (err) => {
            console.error('[API]', '⚠ Websocket error:', err);
        });
    }

    static handleIncoming(msgData) {
        msgData = JSON.parse(msgData);

        if (msgData.constructor === Array) {
            msgData.forEach((msg) => {
                this.handleIncomingMessage(msg);
            });
        } else {
            this.handleIncomingMessage(msgData);
        }
    }

    static handleIncomingMessage(msg) {
        if (msg.op) {
            this.emit(msg.op, msg);
        }
    }

    static get isConnected() {
        return this.ws && this.ws.readyState === 1;
    }

    static scheduleRetry() {
        if (!this.retrySecs) {
            this.retrySecs = 3;
        }

        console.log('[API]', `⌛ Retrying API connection in ${this.retrySecs} secs...`);

        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = null;
        }

        this.retryTimeout = setTimeout(() => {
            ApiClient.open();
        }, this.retrySecs * 1000);

        if (this.retrySecs >= ApiClient.RETRY_MAX_SECS) {
            this.retrySecs = ApiClient.RETRY_MAX_SECS;
        } else {
            this.retrySecs *= ApiClient.RETRY_FACTOR;
            this.retrySecs = Math.round(this.retrySecs);
        }
    }

    static subscribe(subscriptionId, eventType, callback) {
        this.subscriptions[subscriptionId] = {
            id: subscriptionId,
            type: eventType,
            fn: callback
        };
    }

    static subscribeGreedy(subscriptionId, eventType, callback) {
        this.subscribe(subscriptionId, eventType, callback);

        if (typeof this.greedyCache[eventType] !== "undefined" && this.greedyCache[eventType]) {
            try {
                callback(this.greedyCache[eventType]);
            } catch (e) {
                console.error('[API/Callback]', `(greedy:${eventType}:${subscriptionId})`, e.message || "Unknown error");
            }
        }
    }

    static emit(eventType, data, noCache) {
        console.debug('[API/Emit]', eventType);

        if (!noCache) {
            this.greedyCache[eventType] = data;
        }

        Object.keys(this.subscriptions).forEach((key) => {
            let sub = this.subscriptions[key];

            if (sub && sub.type === eventType) {
                try {
                    sub.fn(data);
                } catch (e) {
                    console.error('[API/Callback]', `(${sub.type}:${sub.id})`, e.message || "Unknown error");
                }
            }
        });
    }

    static unsubscribe(subscriptionId) {
        delete this.subscriptions[subscriptionId];
    }
}

ApiClient.RETRY_FACTOR = 1.5;
ApiClient.RETRY_MAX_SECS = 60;

ApiClient.EVENT_TYPE_CONNECTED = "api_connected";
ApiClient.EVENT_TYPE_DISCONNECTED = "api_disconnected";

ApiClient.OP_LOGIN_NEEDED = "must_login";
ApiClient.OP_LOGIN = "login";
