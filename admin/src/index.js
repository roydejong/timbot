import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import ApiClient from "./Api/ApiClient";

ApiClient.init("ws://jeeves:4269/api");

ReactDOM.render(<App />, document.getElementById('root'));
