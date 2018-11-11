import React, {Component} from 'react';
// import './BotStatus.css';
import ApiRequest from "../Api/ApiRequest";
import ApiClient from "../Api/ApiClient";

export default class BotStatus extends Component {
    constructor(props) {
        super(props);

        this.state = {
            busy: false,
            statusType: BotStatus.TYPE_AUTO,
            statusText: "",
            statusUrl: "",
            statusChanged: false
        };
    }

    componentDidMount() {
        ApiClient.subscribe("Panels_BotStatus", "status", this.handleActivityUpdate.bind(this));
    }

    componentWillUnmount() {
        ApiClient.unsubscribe("Panels_BotStatus");
    }

    handleActivityUpdate(data) {
        this.setState({
            statusType: data.type || BotStatus.TYPE_AUTO,
            statusText: data.text || "",
            statusUrl: data.url || "",
            statusChanged: false
        });
    }

    handleStatusTypeChange(key) {
        this.setState({ statusType: key, statusChanged: true });
    }

    handleStatusTextChange(e) {
        let nextValue = e.target.value;
        this.setState({ statusText: nextValue, statusChanged: true });
    }

    handleStatusUrlChange(e) {
        let nextValue = e.target.value;
        this.setState({ statusUrl: nextValue, statusChanged: true });
    }

    handleUpdateClick() {
        if (this.state.busy) {
            return;
        }

        this.setState({
            busy: true
        });

        let req = new ApiRequest({
            op: "activity",
            type: this.state.statusType,
            text: this.state.statusText,
            url: this.state.statusUrl
        });

        req.send()
            .then(() => {

            })
            .catch((err) => {
                console.error('[BotStatus]', `Error during status change:`, err);
            })
            .then(() => {
                this.setState({
                    busy: false
                });
            });
    }

    render() {
        return (
            <div className="card">
                <h5 className="card-header"><i className={"mdi mdi-gamepad"}/> Status and activity</h5>
                <div className="card-body">
                    <p className="card-text text-secondary">You can override the bot's current status / activity here.</p>
                    <div>
                        <div className={"form-group"}>
                            {Object.keys(BotStatus.TYPES).map((key) => {
                                let label = BotStatus.TYPES[key];

                                return (
                                    <div className="form-check form-check-inline" key={key}>
                                        <input className="form-check-input" type="radio" id={key} value={key}
                                               checked={this.state.statusType === key}
                                               onChange={this.handleStatusTypeChange.bind(this, key)}
                                        />
                                        <label className="form-check-label" htmlFor={key}>{label}</label>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="form-group">
                            <label htmlFor="BotStatusText">Status text:</label>
                            <input type="text" className="form-control" id="BotStatusText"
                                   placeholder={"Activity name"}
                                   onChange={this.handleStatusTextChange.bind(this)}
                                   value={this.state.statusText}
                                   disabled={this.state.busy || this.state.statusType === BotStatus.TYPE_AUTO}
                            />
                        </div>
                        {this.state.statusType === BotStatus.TYPE_STREAMING &&
                            <div className="form-group">
                                <label htmlFor="BotStatusUrl">URL:</label>
                                <input type="text" className="form-control" id="BotStatusUrl"
                                       onChange={this.handleStatusUrlChange.bind(this)}
                                       placeholder={"Twitch stream URL"}
                                       value={this.state.statusUrl}
                                       disabled={this.state.busy || this.state.statusType === BotStatus.TYPE_AUTO}
                                />
                            </div>
                        }
                    </div>
                    {this.state.statusChanged &&
                    <button className="btn btn-primary" disabled={this.state.busy}
                            onClick={this.handleUpdateClick.bind(this)}>Update status</button>
                    }
                </div>
            </div>
        );
    }
}

BotStatus.TYPE_AUTO = "AUTO";
BotStatus.TYPE_PLAYING = "PLAYING";
BotStatus.TYPE_STREAMING = "STREAMING";
BotStatus.TYPE_LISTENING = "LISTENING";
BotStatus.TYPE_WATCHING = "WATCHING";

BotStatus.TYPES = { };
BotStatus.TYPES[BotStatus.TYPE_AUTO] = "Automatic";
BotStatus.TYPES[BotStatus.TYPE_PLAYING] = "Playing";
BotStatus.TYPES[BotStatus.TYPE_STREAMING] = "Streaming";
BotStatus.TYPES[BotStatus.TYPE_LISTENING] = "Listening";
BotStatus.TYPES[BotStatus.TYPE_WATCHING] = "Watching";

BotStatus.propTypes = {

};
