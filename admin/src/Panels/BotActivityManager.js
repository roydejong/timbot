import React, {Component} from 'react';
// import './BotStatus.css';
import ApiRequest from "../Api/ApiRequest";
import ApiClient from "../Api/ApiClient";

export default class BotActivityManager extends Component {
    constructor(props) {
        super(props);

        this.state = {
            busy: false,
            statusType: BotActivityManager.TYPE_AUTO,
            statusText: "",
            statusUrl: "",
            statusChanged: false
        };
    }

    componentDidMount() {
        ApiClient.subscribe("Panels_BotStatus", "activity", this.handleActivityUpdate.bind(this));
    }

    componentWillUnmount() {
        ApiClient.unsubscribe("Panels_BotStatus");
    }

    handleActivityUpdate(data) {
        this.setState({
            statusType: data.type || BotActivityManager.TYPE_AUTO,
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
                            {Object.keys(BotActivityManager.TYPES).map((key) => {
                                let label = BotActivityManager.TYPES[key];

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
                                   disabled={this.state.busy || this.state.statusType === BotActivityManager.TYPE_AUTO}
                            />
                        </div>
                        {this.state.statusType === BotActivityManager.TYPE_STREAMING &&
                            <div className="form-group">
                                <label htmlFor="BotStatusUrl">URL:</label>
                                <input type="text" className="form-control" id="BotStatusUrl"
                                       onChange={this.handleStatusUrlChange.bind(this)}
                                       placeholder={"Twitch stream URL"}
                                       value={this.state.statusUrl}
                                       disabled={this.state.busy || this.state.statusType === BotActivityManager.TYPE_AUTO}
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

BotActivityManager.TYPE_AUTO = "AUTO";
BotActivityManager.TYPE_PLAYING = "PLAYING";
BotActivityManager.TYPE_STREAMING = "STREAMING";
BotActivityManager.TYPE_LISTENING = "LISTENING";
BotActivityManager.TYPE_WATCHING = "WATCHING";

BotActivityManager.TYPES = { };
BotActivityManager.TYPES[BotActivityManager.TYPE_AUTO] = "Automatic";
BotActivityManager.TYPES[BotActivityManager.TYPE_PLAYING] = "Playing";
BotActivityManager.TYPES[BotActivityManager.TYPE_STREAMING] = "Streaming";
BotActivityManager.TYPES[BotActivityManager.TYPE_LISTENING] = "Listening";
BotActivityManager.TYPES[BotActivityManager.TYPE_WATCHING] = "Watching";

BotActivityManager.propTypes = {

};
