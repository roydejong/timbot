import React, {Component} from 'react';
import {BrowserRouter as Router, Route} from "react-router-dom";
import DashPage from "./Pages/DashPage";
import ReactionsPage from "./Pages/Reactions/ReactionsPage";
import LoginPage from "./Pages/LoginPage";
import ApiClient from "./Api/ApiClient";
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import ServersPage from "./Pages/Servers/ServersPage";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mustLogin: false
        }
    }

    componentDidMount() {
        ApiClient.subscribe("App_login_request", ApiClient.OP_LOGIN_NEEDED, this.handleLoginNeeded.bind(this));
        ApiClient.subscribe("App_login_result", ApiClient.OP_LOGIN, this.handleLoginResult.bind(this));
    }

    componentWillUnmount() {
        ApiClient.unsubscribe("App_login_request");
        ApiClient.unsubscribe("App_login_result");
    }

    handleLoginNeeded() {
        if (!this.state.mustLogin) {
            this.setState({
                mustLogin: true
            });

            toast.dismiss();
            toast.warn("You must log in to continue.");
        }
    }

    handleLoginResult(data) {
        if (data.ok) {
            toast.dismiss();

            this.setState({
                mustLogin: false
            });
        }
    }

    render() {
        return (
            <div className="App">
                <Router>
                    <div>
                        {this.state.mustLogin &&
                        <LoginPage/>
                        }
                        {!this.state.mustLogin &&
                        <div>
                            <Route path={"/"} exact={true} component={DashPage}/>
                            <Route path={"/behavior"} exact={true} component={ReactionsPage}/>
                            <Route path={"/servers"} exact={true} component={ServersPage}/>
                        </div>
                        }
                        <ToastContainer position={toast.POSITION.BOTTOM_CENTER} />
                    </div>
                </Router>
            </div>
        );
    }
}

export default App;
