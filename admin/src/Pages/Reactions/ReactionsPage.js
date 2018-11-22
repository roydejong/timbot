import React, {Component} from 'react';
import AppPage from "../../Base/AppPage";
import ReactionEdit from "./ReactionEdit";
import './ReactionsPage.css';
import ApiRequest from "../../Api/ApiRequest";
import ApiClient from "../../Api/ApiClient";
import ReactionsTable from "./ReactionsTable";
import {toast} from 'react-toastify';

export default class ReactionsPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showEditor: false,
            editItem: null,
            isLoading: false,
            reactions: []
        };
    }

    refresh() {
        this.setState({
            isLoading: true
        });

        new ApiRequest({ op: "reactions_fetch" }).send()
            .catch((e) => {
                toast.error("Could not load reactions list.");
                console.error("(ReactionsPage) Refresh request error:", e);
                this.setState({ isLoading: false });
            })
    }

    componentDidMount() {
        ApiClient.subscribeGreedy("ReactionsPage_connect", ApiClient.EVENT_TYPE_CONNECTED, this.handleApiConnect.bind(this));
        ApiClient.subscribeGreedy("ReactionsPage_fetch", "reactions_fetch", this.handleApiData.bind(this));

        if (ApiClient.isConnected) {
            this.refresh();
        }
    }

    componentWillUnmount() {
        ApiClient.unsubscribe("ReactionsPage_connect");
        ApiClient.unsubscribe("ReactionsPage_fetch");
    }

    handleApiConnect() {
        this.refresh();
    }

    handleApiData(data) {
        this.setState({
            reactions: data.reactions || [],
            isLoading: false
        });
    }

    handleEditorDismiss(didComplete) {
        if (this.state.showEditor) {
            this.setState({
                showEditor: false,
                editItem: null
            });
        }

        if (didComplete) {
            this.refresh();
        }
    }

    handleNewClick() {
        this.setState({
            showEditor: true,
            editItem: null
        });
    }

    handleReactionClick(reaction) {
        this.setState({
            showEditor: true,
            editItem: reaction
        });
    }

    handleReactionDelete(reaction) {
        new ApiRequest({
            op: "reaction_delete",
            id: reaction.id || null
        })
            .send()
            .then(() => {
                toast.success("Reaction deleted.");
            })
            .catch((e) => {
                toast.error("Could not delete reaction.");
                console.error("(ReactionsPage) Delete request error:", e);
            })
    }

    render() {
        let isBusy = this.state.isLoading;

        return (
            <AppPage activeTab={"behavior"} title={"Manage bot actions"} busy={isBusy}>
                <div className={"ReactionsPageHead"}>
                    <div className={"container"}>

                        {this.state.showEditor &&
                        <ReactionEdit
                            onDismiss={this.handleEditorDismiss.bind(this, false)}
                            onComplete={this.handleEditorDismiss.bind(this, true)}
                            reaction={this.state.editItem}
                        />
                        }

                        <div className={"ReactionsPage__controls row"}>
                            <div className={"ReactionsPage__controls-l col-md-3"}>
                                <a href={"#"} className={"btn btn-success"} role={"button"} onClick={this.handleNewClick.bind(this)}>
                                    <i className={"mdi mdi-plus-circle"}/>&nbsp;
                                    <span>Set up new behavior</span>
                                </a>
                            </div>
                            <div className={"ReactionsPage__controls-r col-md-9 text-right"}>
                                <p className={"text-secondary"}>
                                    <i className={"mdi mdi-flash-circle"}/>
                                    <strong>Each behavior has a trigger (such as a message or event), and one or more actions.</strong><br />
                                    Use behaviors to define how Timbot reacts to messages, posts announcements, etc.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
                <div className={"ReactionsPageBody"}>
                    <div className={"container"}>
                        <ReactionsTable reactions={this.state.reactions}
                                        onReactionClicked={this.handleReactionClick.bind(this)}
                                        onReactionDelete={this.handleReactionDelete.bind(this)}
                        />
                    </div>
                </div>
            </AppPage>
        );
    }
}
