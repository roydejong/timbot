import React, {Component} from 'react';
import AppPage from "../../Base/AppPage";
import ServersTable from "./ServersTable";
import ApiRequest from "../../Api/ApiRequest";
import ApiClient from "../../Api/ApiClient";
import {toast} from 'react-toastify';

export default class ServersPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isFetching: false,
            servers: null
        };

        this.handleServerList = this.handleServerList.bind(this);
        this.handleApiConnect = this.handleApiConnect.bind(this);
    }

    componentDidMount() {
        ApiClient.subscribeGreedy("ServersPage_connect", ApiClient.EVENT_TYPE_CONNECTED, this.handleApiConnect);
        ApiClient.subscribeGreedy("ServersPage_fetch", "list_servers", this.handleServerList);

        if (ApiClient.isConnected) {
            this.fetchServers();
        }
    }

    componentWillUnmount() {
        ApiClient.unsubscribe("ServersPage_connect");
        ApiClient.unsubscribe("ServersPage_fetch");
    }

    fetchServers() {
        if (this.state.isFetching) {
            return;
        }

        this.setState({
            isFetching: true
        });

        let req = new ApiRequest({
            "op": "list_servers"
        });

        req.send()
            .catch((err) => {
                toast.error("Unable to load server list.");

                console.error('(ServersPage)', 'Error fetching server list:', err);

                this.setState({
                    isFetching: false
                });
            });
    }

    handleApiConnect() {
        this.fetchServers();
    }

    handleServerList(data) {
        this.setState({
            isFetching: false,
            servers: data.servers || []
        });
    }

    handleServerClick(server) {
        // ...
    }

    handleServerDelete(server) {
        let req = new ApiRequest({
            "op": "leave_server",
            "id": server.id
        });

        req.send()
            .catch((err) => {
                toast.error("Unable to send delete request.");
                console.error('(ServersPage)', 'Error sending leave request:', err);
            });
    }

    render() {
        let isBusy = this.state.isFetching;

        return (
            <AppPage activeTab={"servers"} title={"Server list"} busy={isBusy}>
                <div className={"ServersPage"}>
                    <div className={"container"}>
                        <div className={"ServersPage__table"}>
                            <ServersTable servers={this.state.servers || []}
                                          onServerClicked={this.handleServerClick.bind(this)}
                                          onServerDelete={this.handleServerDelete.bind(this)}
                            />
                        </div>
                    </div>
                </div>
            </AppPage>
        );
    }
}

ServersPage.propTypes = {

};
