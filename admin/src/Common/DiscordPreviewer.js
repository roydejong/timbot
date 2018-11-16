import React, {Component} from 'react';
import './DiscordPreviewer.css';
import PropTypes from 'prop-types';
import ReactionEdit from "../Pages/Reactions/ReactionEdit";

export default class DiscordPreviewer extends Component {
    render() {
        let classNames = ["DiscordPreviewer"];

        let txt = <div>{this.props.text}</div>;

        if (this.props.exampleTrigger) {
            let exText = this.props.exampleTrigger || "";

            if (this.props.exampleTriggerInsensitive) {
                exText = exText.toLowerCase();
            }

            let msgPrefix = (null);

            if (this.props.exampleTriggerMustMention) {
                msgPrefix = <span className={"botmention"}>@Timbot</span>;
            }

            switch (this.props.exampleTriggerMode) {
                case ReactionEdit.TYPE_TEXT:
                    txt = <div>{msgPrefix}Must contain "<span className={"hi"}>{exText}</span>" anywhere, even if it's in the middle of another word.</div>;
                    break;
                case ReactionEdit.TYPE_MESSAGE:
                    txt = <div>{msgPrefix}<span className={"hi"}>{exText}</span></div>;
                    break;
                case ReactionEdit.TYPE_KEYWORD:
                    txt = <div>{msgPrefix}Must contain the phrase <span className={"hi"}>{exText}</span> somewhere.</div>;
                    break;
            }
        } else if (this.props.mentionUser) {
            txt = <div><span className={"botmention"}>@{this.props.mentionUser}</span> {this.props.text}</div>
        }

        return (
            <div className={classNames.join('')}>
                <div className={"DiscordPreviewer__msg"}>
                    <div className={"DiscordPreviewer__msg-cozy"}>
                        <div className={"DiscordPreviewer__msg-header"}>
                            <div className={"DiscordPreviewer__msg-header-avatar"}>
                                <div className={"DiscordPreviewer__msg-header-avatar-image"} style={{ backgroundImage: `url("${this.props.avatarUrl}")` }}/>
                            </div>
                            <h2 className={"DiscordPreviewer__msg-header-user"}>
                                <span><span className="DiscordPreviewer__msg-header-user-text" style={{ color: "rgb(255, 0, 220)" }}>{this.props.username}</span></span>
                                {this.props.isBot && <span className="DiscordPreviewer__msg-bot-tag">BOT</span>}
                                <time className="DiscordPreviewer__msg-header-user-ts">Today at 4:20 AM</time>

                            </h2>
                        </div>
                        <div className={"DiscordPreviewer__msg-content"}>
                            {txt}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

DiscordPreviewer.defaultProps = {
    username: "Sample Cat",
    text: "Sample message preview",
    avatarUrl: "https://cdn.discordapp.com/avatars/146770498905309184/36a61f1a51db7af5979cd2035068c4fe.webp?size=128",
    isBot: false
};

DiscordPreviewer.propTypes = {
    username: PropTypes.string,
    text: PropTypes.string,
    avatarUrl: PropTypes.string,
    isBot: PropTypes.bool,
    mentionUser: PropTypes.string,

    exampleTrigger: PropTypes.string,
    exampleTriggerMode: PropTypes.number,
    exampleTriggerMustMention: PropTypes.bool,
    exampleTriggerInsensitive: PropTypes.bool
};
