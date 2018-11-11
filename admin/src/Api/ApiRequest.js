import ApiClient from "./ApiClient";

export default class ApiRequest {
    constructor(obj) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof this[key] === "undefined") {
                    this[key] = obj[key];
                }
            }
        }
    }

    get asMessage() {
        return JSON.stringify(this);
    }

    send() {
        return new Promise((resolve, reject) => {
            if (!ApiClient.isConnected) {
                reject(new Error('Not connected, cannot send message'));
                return;
            }

            try {
                ApiClient.ws.send(this.asMessage);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }
}
