import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './ReactionEdit.css';
import Modal from "../../Common/Modal";
import DiscordPreviewer from "../../Common/DiscordPreviewer";
import ApiRequest from "../../Api/ApiRequest";

export default class ReactionEdit extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            isEditing: false,
            isSubmitting: false,
            step: 0
        };
    }

    // -----------------------------------------------------------------------------------------------------------------

    componentWillReceiveProps(nextProps) {
        this.processProps(nextProps);
    }

    componentDidMount() {
        this.processProps(this.props);
    }

    processProps(props) {
        let isEditing = !!props.reaction;
        let formData = isEditing ? props.reaction : { id: null };

        if (!isEditing) {
            formData["must_mention"] = 1;
            formData["insensitive"] = 1;
        }

        this.setState({
            isEditing: isEditing,
            data: formData,
            step: 0
        });
    }

    // -----------------------------------------------------------------------------------------------------------------

    handleFieldEdit(propName, e) {
        let nextData = this.state.data;
        let value = e.target.value;

        if (nextData[propName] !== value) {
            nextData[propName] = value;

            this.setState({
                data: nextData
            });
        }
    }

    handleFieldCheckEdit(propName, e) {
        let nextData = this.state.data;
        let value = e.target.checked ? 1 : 0;

        if (nextData[propName] !== value) {
            nextData[propName] = value;

            this.setState({
                data: nextData
            });
        }
    }

    handleConfirm() {
        if (this.state.isSubmitting) {
            return;
        }

        if (this.state.step === 0) {
            // Move from step 0 to step 1
            this.setState({ step: 1 });
            return;
        }

        // Submit to server ---
        this.setState({
            isSubmitting: false
        });

        let payload = Object.assign(
            { "op": "reaction_write" },
            this.state.data,
        );

        let request = new ApiRequest(payload);
        request.send()
            .then(() => {
                this.props.onComplete();
            })
            .catch((e) => {
                console.error('(ReactionEdit) Save API error:', e);
            })
            .then(() => {
                this.setState({
                    isSubmitting: false
                });
            });
    }

    handleDismiss() {
        if (this.state.isSubmitting) {
            return;
        }

        if (this.state.step === 1) {
            this.setState({ step: 0 });
        } else {
            this.props.onDismiss();
        }
    }

    // -----------------------------------------------------------------------------------------------------------------

    render() {
        if (!this.state.data) {
            return (null);
        }

        let modalTitle = this.state.isEditing ? "Edit reaction" : "Set up new reaction";

        let confirmLabel = "Save reaction";
        let confirmEnabled = true;

        let cancelLabel = "Cancel";

        let showTriggerText = false;

        if (this.state.step === 0) {
            modalTitle += " (1 of 2)";

            confirmLabel = "Continue";
            confirmEnabled = this.state.data.type && this.state.data.trigger;

            showTriggerText = !!this.state.data.type;
        } else if (this.state.step === 1) {
            modalTitle += " (2 of 2)";
            confirmEnabled = this.state.data.response || this.state.data.emote;

            cancelLabel = "← Go back";
        }

        return (
            <Modal title={modalTitle} onDismiss={this.handleDismiss.bind(this)} confirmLabel={confirmLabel}
                   onConfirm={this.handleConfirm.bind(this)} canConfirm={!!confirmEnabled}
                   dismissLabel={cancelLabel} busy={this.state.isSubmitting}
            >
                <div className={"ReactionEdit"}>
                    <form>
                        <div className="form-group">
                            {this.state.step === 0 &&
                            <div>
                                <label><i className={"mdi mdi-lightbulb-on-outline"}/> What triggers the reaction?</label>

                                <select className="form-control" value={this.state.data.type || -1}
                                        onChange={this.handleFieldEdit.bind(this, "type")}>
                                    <option value={-1} disabled={true}>Choose trigger type</option>
                                    {Object.keys(ReactionEdit.TYPES).map((key) => {
                                        let value = ReactionEdit.TYPES[key];
                                        return <option key={'reaction_type_' + key} value={key}>{value}</option>;
                                    })}
                                </select>

                                {showTriggerText &&
                                <div className={"form-group-secondary"}>
                                    <input type="text" className="form-control"
                                           placeholder={"Enter trigger text"}
                                           value={this.state.data.trigger || ""}
                                           onChange={this.handleFieldEdit.bind(this, "trigger")}
                                    />
                                </div>
                                }

                                {showTriggerText &&
                                <div className={"form-group-secondary"}>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="must_mention"
                                               checked={this.state.data.must_mention === 1}
                                               onChange={this.handleFieldCheckEdit.bind(this, "must_mention")}
                                        />
                                        <label className="form-check-label" htmlFor="must_mention">
                                            Only trigger if bot is mentioned or receives as DM
                                        </label>
                                    </div>
                                </div>
                                }

                                {showTriggerText &&
                                <div className={"form-group-secondary"}>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="insensitive"
                                               checked={this.state.data.insensitive === 1}
                                               onChange={this.handleFieldCheckEdit.bind(this, "insensitive")}
                                        />
                                        <label className="form-check-label" htmlFor="insensitive">
                                            Insensitive: Ignore casing and grammatical punctuation
                                        </label>
                                    </div>
                                </div>
                                }

                                {showTriggerText && this.state.data.trigger && this.state.data.type &&
                                    <DiscordPreviewer exampleTrigger={this.state.data.trigger}
                                                      exampleTriggerMode={this.state.data.type}
                                                      exampleTriggerMustMention={this.state.data.must_mention === 1}
                                                      exampleTriggerInsensitive={this.state.data.insensitive === 1}
                                    />
                                }

                                <small className={"text-muted"}>
                                    <i className={"mdi mdi-earth"}/> Currently, all triggers are global. This rule will
                                    apply in every server and channel, including any DMs sent to the bot.
                                </small>

                            </div>
                            }

                            {this.state.step === 1 &&
                                <div className="form-group">
                                    <label htmlFor="type"><i className={"mdi mdi-chat-processing"}/> How should the bot react?</label>

                                    <textarea value={this.state.data.response}
                                              onChange={this.handleFieldEdit.bind(this, "response")}
                                              placeholder={"Reaction text"}
                                              className={"form-control"}
                                    />

                                    {this.state.data.response &&
                                    <div className={"form-group-secondary"}>
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="do_mention"
                                                   checked={this.state.data.do_mention === 1}
                                                   onChange={this.handleFieldCheckEdit.bind(this, "do_mention")}
                                            />
                                            <label className="form-check-label" htmlFor="do_mention">
                                                Mention the sender in the reply (if not a DM)
                                            </label>
                                        </div>
                                    </div>
                                    }

                                    <div className={"form-group-secondary"}>
                                        <input type="text" className="form-control" placeholder={"Reaction emote, e.g. :tada:"}
                                               value={this.state.data.emote}
                                               onChange={this.handleFieldEdit.bind(this, "emote")}
                                        />
                                    </div>

                                    {this.state.data.response && <DiscordPreviewer
                                        username={"Timbot"} text={this.state.data.response}
                                        mentionUser={this.state.data.do_mention === 1 ? "Sample Cat" : ""}
                                        avatarUrl={"/images/timbot_bepis2.png"} isBot={true}
                                    />
                                    }

                                    <small className={"text-muted"}>The bot response can be a message or emote reaction, or both.<br />For emotes, use the Discord style syntax (e.g. ":tada:") or paste in an actual 🎉 emoji.</small>
                                </div>
                            }
                        </div>
                    </form>
                </div>
            </Modal>
        );
    }
}

ReactionEdit.TYPES = { };

ReactionEdit.TYPE_KEYWORD = "keyword";
ReactionEdit.TYPES[ReactionEdit.TYPE_KEYWORD] = "Message: A keyword or phrase";

ReactionEdit.TYPE_TEXT = "text";
ReactionEdit.TYPES[ReactionEdit.TYPE_TEXT] = "Message: Text anywhere in the message";

ReactionEdit.TYPE_MESSAGE = "message";
ReactionEdit.TYPES[ReactionEdit.TYPE_MESSAGE] = "Message: Exact match";

ReactionEdit.propTypes = {
    reaction: PropTypes.object,
    onDismiss: PropTypes.func.isRequired,
    onComplete: PropTypes.func.isRequired
};
