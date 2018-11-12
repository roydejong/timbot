import React, {Component} from 'react';
import './AppPage.css';
import Navbar from "./Navbar";
import PropTypes from 'prop-types';

export default class AppPage extends Component {
    render() {
        return (
            <div className={"AppPage"}>
                <Navbar activeTab={this.props.activeTab}/>

                <div className={"AppPage__content"}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

AppPage.propTypes = {
    activeTab: PropTypes.string.isRequired
};
