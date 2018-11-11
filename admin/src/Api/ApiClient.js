export default class ApiClient {
    static init(wsUrl) {
        this.wsUrl = wsUrl;
        this.retrySecs = 3;
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

        console.info('[api]', `Connecting to ${this.wsUrl}...`);

        this.ws.addEventListener('open', () => {
            this.retrySecs = 3;
            console.info('[api]', 'Websocket open.');
        });

        this.ws.addEventListener('message', (msg) => {
            console.info('[api]', 'Websocket message:', msg);
        });

        this.ws.addEventListener('close', () => {
            console.warn('[api]', 'Websocket closed.');
            this.scheduleRetry();
        });

        this.ws.addEventListener('error', (err) => {
            console.error('[api]', 'Websocket error:', err);
        });
    }

    static get isConnected() {
        return this.ws && this.ws.readyState === 1;
    }

    static scheduleRetry() {
        if (!this.retrySecs) {
            this.retrySecs = 3;
        }

        console.warn('[api]', `Retrying API connection in ${this.retrySecs} secs...`);

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
}

ApiClient.RETRY_FACTOR = 1.5;
ApiClient.RETRY_MAX_SECS = 60;
