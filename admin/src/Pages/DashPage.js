import React, {Component} from 'react';
import BotActivityManager from "../Panels/BotActivityManager";
import AppPage from "../Base/AppPage";

export default class DashPage extends Component {
    render() {
        return (
            <AppPage activeTab={"dash"}>
                <div className={"container"}>
                    <br />
                    <BotActivityManager/>
                </div>
            </AppPage>
        );
    }
}

DashPage.propTypes = {

};
