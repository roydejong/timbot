import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './ReactionEdit.css';
import Modal from "../../Common/Modal";
import DiscordPreviewer from "../../Common/DiscordPreviewer";
import ApiRequest from "../../Api/ApiRequest";
import {toast} from 'react-toastify';
import ApiClient from "../../Api/ApiClient";
import BehaviorOptionForm from "./BehaviorOptionForm";

export default class ReactionEdit extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoadingConfig: false,
            config: null,
            data: null,
            isEditing: false,
            isSubmitting: false,
            step: 0,
            selectedTrigger: null
        };

        this.handleApiConnect = this.handleApiConnect.bind(this);
        this.handleConfigData = this.handleConfigData.bind(this);
    }

    // -----------------------------------------------------------------------------------------------------------------

    componentWillReceiveProps(nextProps) {
        this.processProps(nextProps);
    }

    componentDidMount() {
        this.processProps(this.props);
        
        ApiClient.subscribeGreedy("ReactionEdit_connect", ApiClient.EVENT_TYPE_CONNECTED, this.handleApiConnect);
        ApiClient.subscribeGreedy("ReactionEdit_config", "behavior_config", this.handleConfigData);

        if (ApiClient.isConnected) {
            this.loadConfig();
        }
    }

    componentWillUnmount() {
        ApiClient.unsubscribe("ReactionEdit_connect");
        ApiClient.unsubscribe("ReactionEdit_fetch");
    }

    loadConfig() {
        if (this.state.isLoadingConfig) {
            return;
        }

        this.setState({
            isLoadingConfig: true
        });

        let req = new ApiRequest({
            "op": "behavior_config"
        });

        req.send()
            .catch((err) => {
                toast.error("Unable to load behavior editor data.");

                console.error('(ReactionEdit)', 'Error fetching config:', err);

                this.setState({
                    isLoadingConfig: false
                });
            });
    }

    // -----------------------------------------------------------------------------------------------------------------

    handleApiConnect() {
        this.loadConfig();
    }

    handleConfigData(data) {
        this.setState({
            isLoadingConfig: false,
            config: data
        });
    }

    // -----------------------------------------------------------------------------------------------------------------

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

    handleTriggerTypeChange(e) {
        let newTriggerKey = e.target.value;

        let selectedTrigger = this.state.config.triggers.find((trigger) => {
            return trigger.key === newTriggerKey;
        });

        if (selectedTrigger) {
            let nextData = this.state.data;
            nextData["trigger_type"] = selectedTrigger.key;

            this.setState({
                selectedTrigger: selectedTrigger,
                data: nextData
            });
        }
    }

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
                toast.success("Reaction saved.");
            })
            .catch((e) => {
                toast.error("Could not save reaction.");
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

    handleBehaviorOptionChange() {
        alert('!');
    }

    // -----------------------------------------------------------------------------------------------------------------

    render() {
        if (!this.state.data) {
            return (null);
        }

        let modalTitle = this.state.isEditing ? "Edit behavior" : "Set up new behavior";

        let confirmLabel = "Save behavior";
        let confirmEnabled = true;

        let cancelLabel = "Cancel";

        let showTriggerText = false;

        if (this.state.step === 0) {
            modalTitle += " (1 of 2)";

            confirmLabel = "Next →";
            confirmEnabled = this.state.data.type && this.state.data.trigger;

            showTriggerText = !!this.state.data.type;
        } else {
            if (this.state.step === 1) {
                modalTitle += " (2 of 2)";
                confirmEnabled = this.state.data.response || this.state.data.emote;
            }

            cancelLabel = "← Step back";
        }

        return (
            <Modal title={modalTitle} onDismiss={this.handleDismiss.bind(this)} confirmLabel={confirmLabel}
                   onConfirm={this.handleConfirm.bind(this)} canConfirm={!!confirmEnabled}
                   dismissLabel={cancelLabel} busy={this.state.isSubmitting}
            >
                <div className={"ReactionEdit"}>
                    <form>
                        <div className="form-group">
                            {this.state.isLoadingConfig &&
                            <div>
                                Loading behavior config...
                            </div>
                            }

                            {!this.state.isLoadingConfig && this.state.step === 0 &&
                            <div>
                                <label><i className={"mdi mdi-lightbulb-on-outline"}/> What will trigger this behavior?</label>

                                <select className="form-control" value={this.state.data.trigger_type || -1}
                                        onChange={this.handleTriggerTypeChange.bind(this)}>
                                    <option value={-1} disabled={true}>Choose trigger type</option>
                                    {Object.values(this.state.config.triggers).map((trigger) => {
                                        return <option value={trigger.key} key={`trigger_${trigger.key}`}>{trigger.label}</option>;
                                    })}
                                </select>

                                {this.state.selectedTrigger &&
                                    <BehaviorOptionForm options={this.state.selectedTrigger.options}
                                                        entityName={"Trigger"}
                                                        onEntryChange={this.handleBehaviorOptionChange.bind(this)}
                                    />
                                }
                                
                            </div>
                            }

                            {!this.state.isLoadingConfig && this.state.step === 1 &&
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
