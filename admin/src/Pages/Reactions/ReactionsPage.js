import React, {Component} from 'react';
import AppPage from "../../Base/AppPage";
import ReactionEdit from "./ReactionEdit";
import './ReactionsPage.css';
import ApiRequest from "../../Api/ApiRequest";
import ApiClient from "../../Api/ApiClient";
import ReactionsTable from "./ReactionsTable";

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
                console.error("(ReactionsPage) Refresh request error:", e);
            })
    }

    componentDidMount() {
        ApiClient.subscribeGreedy("ReactionsPage_connect", ApiClient.EVENT_TYPE_CONNECTED, this.handleApiConnect.bind(this));
        ApiClient.subscribeGreedy("ReactionsPage_fetch", "reactions_fetch", this.handleApiData.bind(this));

        this.refresh();
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
            .catch((e) => {
                console.error("(ReactionsPage) Delete request error:", e);
            })
    }

    render() {
        let isBusy = this.state.isLoading;

        return (
            <AppPage activeTab={"reactions"} title={"Manage reactions"} busy={isBusy}>
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
                            <div className={"ReactionsPage__controls-l col-md-2"}>
                                <a href={"#"} className={"btn btn-success"} role={"button"} onClick={this.handleNewClick.bind(this)}>
                                    <i className={"mdi mdi-plus"}/>
                                    <span>New reaction</span>
                                </a>
                            </div>
                            <div className={"ReactionsPage__controls-r col-md-10"}>
                                <p className={"text-secondary"}>
                                    <i className={"mdi mdi-flash-circle"}/>
                                    <strong>Reactions are automatic bot actions and responses with configurable chat triggers.</strong><br />
                                    Add a new reaction, or click on an existing one to modify it.
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
