import React, {Component} from 'react';
import AppPage from "../../Base/AppPage";
import ReactionEdit from "./ReactionEdit";

export default class ReactionsPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showEditor: true
        };
    }

    handleEditorDismiss() {
        if (this.state.showEditor) {
            this.setState({
                showEditor: false
            });
        }
    }

    render() {
        return (
            <AppPage activeTab={"reactions"} title={"Manage reactions"}>
                <div className={"container"}>

                    {this.state.showEditor &&
                    <ReactionEdit onDismiss={this.handleEditorDismiss.bind(this)}/>
                    }

                </div>
            </AppPage>
        );
    }
}
