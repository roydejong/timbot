import React, {Component} from 'react';
import './Navbar.css';
import NavbarItem from "./NavbarItem";
import ApiClient from "../Api/ApiClient";
import PropTypes from 'prop-types';

export default class Navbar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isConnected: false
        };
    }

    refreshStatus() {
        let nextIsConnected = ApiClient.isConnected;

        if (this.state.isConnected !== nextIsConnected) {
            this.setState({
                isConnected: nextIsConnected
            });
        }
    }

    componentDidMount() {
        this.checkInterval = setInterval(() => {
            this.refreshStatus();
        }, 250);

        this.refreshStatus();
    }

    componentWillUnmount() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    getTabs() {
        return {
            "dash": { label: "Dash", href: "/", icon: <i className={"mdi mdi-home"}/> },
            "behavior": { label: "Behavior", href: "/behavior", icon: <i className={"mdi mdi-flash-circle"}/> },
            "servers": { label: "Servers", href: "/servers", icon: <i className={"mdi mdi-server"}/> }
        };
    }

    render() {
        let tabs = this.getTabs();

        return (
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className={"container"}>
                    <a className="navbar-brand mb-0 h1" href="/" title={"Timbot"}>
                        <img src="/images/timbot_bepis2.png" width="32" height="32"
                             className="d-inline-block align-top navbar-brand-image" alt="Timbot"/>
                        Timbot
                    </a>
                    <div className="collapse navbar-collapse" id="navbarNavDropdown">
                        <ul className="navbar-nav mr-auto">
                            {this.props.enabled && Object.keys(tabs).map((tabId) => {
                                let tab = tabs[tabId];

                                return <NavbarItem key={tabId} title={tab.label}
                                                   href={tab.href} icon={tab.icon}
                                                   active={tabId === this.props.activeTab}/>
                            })}
                        </ul>
                        <span className="navbar-text">
                            <div className={"navbar-conn"}>
                                {this.state.isConnected && <span>Connected to Timbot</span>}
                                {!this.state.isConnected && <span>Connecting to Timbot</span>}
                                <div className={"navbar-status " + (this.state.isConnected ? "navbar-status--ok" : "navbar-status--busy")}/>
                            </div>
                            <a className={"discord-button"} href={"https://discord.gg/cEFTnKb"}
                               title={"Timbot discord for support, development and discussion"}
                               target={"_blank"}
                            >
                                <i className={"mdi mdi-discord"}/>
                                <span>Discord</span>
                            </a>
                        </span>
                    </div>
                </div>
            </nav>
        );
    }
}

Navbar.defaultProps = {
    enabled: true
};

Navbar.propTypes = {
    activeTab: PropTypes.string.isRequired,
    enabled: PropTypes.bool
};
