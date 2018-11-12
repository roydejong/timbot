import React, {Component} from 'react';
import Navbar from "./Base/Navbar";
import BotActivityManager from "./Panels/BotActivityManager";

class App extends Component {
    render() {
        return (
            <div className="App">
                <Navbar/>
                <div className={"container"}>
                    <br />
                    <BotActivityManager/>
                </div>
            </div>
        );
    }
}

export default App;
