import React, {Component} from 'react';
import ApiClient from "../Api/ApiClient";
import './TimbotInfo.css';

export default class TimbotInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            isAvailable: false
        };
    }

    componentDidMount() {
        ApiClient.subscribeGreedy("Panels_TimbotInfo", "info", this.handleRemoteInfo.bind(this));
    }

    componentWillUnmount() {
        ApiClient.unsubscribe("Panels_TimbotInfo");
    }

    handleRemoteInfo(data) {
        this.setState({
            data: data,
            isAvailable: true
        });
    }

    render() {
        let cardBody = (null);

        if (!this.state.isAvailable) {
            cardBody = <div className="card-body">
                <p className={"card-text text-secondary"}>
                    No status information is available right now<br />
                    <a href={"https://github.com/roydejong/timbot"} target={"_blank"}>View project on GitHub</a>
                </p>
            </div>;
        } else {
            cardBody = <div className="card-body">
                <p className={"card-text text-secondary"}>
                    Version {this.state.data.version}<br />
                    <a href={"https://github.com/roydejong/timbot"} target={"_blank"}>View project on GitHub</a>
                </p>
                {this.state.data.discord.connected &&
                <div className={"DiscordCard"}>
                    <img className={"DiscordCard__avatar"} src={this.state.data.discord.avatar} alt={this.state.data.discord.tag}/>
                    <div className={"DiscordCard__text"}>
                        <div className={"DiscordCard__text-name"}>{this.state.data.discord.username}</div>
                        <div className={"DiscordCard__text-sub"}>{this.state.data.discord.tag}</div>
                        <div className={"DiscordCard__text-status"}><i className={"mdi mdi-discord"}/> {"Logged in to Discord"}</div>
                    </div>
                </div>
                }
                {!this.state.data.discord.connected &&
                <div className={"DiscordStatusErr"}>
                    <div>
                        <strong>
                            <div className={"DiscordStatusErr__lamp"}/>
                            Not logged in to Discord!
                        </strong>
                        <span>Check logs for details, and verify that the correct login token is set in the configuration file.</span>
                    </div>
                </div>
                }
            </div>;
        }

        return (
            <div className="card TimbotInfo">
                <h5 className="card-header"><i className={"mdi mdi-robot"}/> Timbot</h5>
                {cardBody}
            </div>
        );
    }
}
