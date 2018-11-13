import React, {Component} from 'react';
import BotActivityManager from "../Panels/BotActivityManager";
import AppPage from "../Base/AppPage";
import TimbotInfo from "../Panels/TimbotInfo";

export default class DashPage extends Component {
    render() {
        return (
            <AppPage activeTab={"dash"} title={"General overview"}>
                <div className={"container"}>
                    <div className={"row"}>
                        <div className={"col-md-5"}>
                            <TimbotInfo/>
                        </div>
                        <div className={"col-md-7"}>
                            <BotActivityManager/>
                        </div>
                    </div>
                </div>
            </AppPage>
        );
    }
}

DashPage.propTypes = {

};
