import React, {Component} from 'react';
import ApiClient from "../Api/ApiClient";
import './TimbotInfo.scss';

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

        let discordLink = (
          <a href={"https://github.com/roydejong/timbot"}
             className={"external-link"}
             target={"_blank"}
             rel="noopener noreferrer">
              <i className={"mdi mdi-github"}/>
              <span>View project on GitHub</span>
          </a>
        );

        if (!this.state.isAvailable) {
            cardBody = <div className="card-body">
                <p className={"card-text text-secondary"}>
                    No status information is available right now<br />
                    {discordLink}
                </p>
            </div>;
        } else {
            cardBody = <div className="card-body">

                <div className={"version-text"}>Version {this.state.data.version}</div>
                {discordLink}

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

                {this.state.data.discord.application && (
                  <a className={"btn btn-primary invite-button"}
                     target={"_blank"} rel="noopener noreferrer"
                     href={`https://discord.com/oauth2/authorize?client_id=510984229686083596&scope=bot&permissions=8`}>
                      <span>Server invite</span>
                      <i className={"mdi mdi-open-in-new"}/>
                  </a>
                )}

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
