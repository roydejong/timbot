import React, {Component} from 'react';
import Navbar from "./Base/Navbar";
import BotStatus from "./Panels/BotStatus";

class App extends Component {
    render() {
        return (
            <div className="App">
                <Navbar/>
                <div className={"container"}>
                    <br />
                    <BotStatus/>
                </div>
            </div>
        );
    }
}

export default App;
