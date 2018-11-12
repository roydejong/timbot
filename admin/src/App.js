import React, {Component} from 'react';
import {BrowserRouter as Router, Link, Route} from "react-router-dom";
import DashPage from "./Pages/DashPage";
import ReactionsPage from "./Pages/ReactionsPage";

class App extends Component {
    render() {
        return (
            <div className="App">
                <Router>
                    <div>
                        <Route path={"/"} exact={true} component={DashPage}/>
                        <Route path={"/reactions"} exact={true} component={ReactionsPage}/>
                    </div>
                </Router>
            </div>
        );
    }
}

export default App;
