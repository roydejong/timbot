import React, {Component} from 'react';
import './AppPage.css';
import Navbar from "./Navbar";
import PropTypes from 'prop-types';

export default class AppPage extends Component {
    render() {
        let classNames = [];
        classNames.push("AppPage");

        if (this.props.busy) {
            classNames.push("AppPage--busy");
        }

        return (
            <div className={classNames.join(' ')}>
                {this.props.busy && <div className={"AppPage__loader"}/>}

                <Navbar activeTab={this.props.activeTab}/>

                <div className={"AppPage__subtitle"}>
                    <div className={"container"}>
                        <span>{this.props.title}</span>
                    </div>
                </div>

                <div className={"AppPage__content"}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

AppPage.propTypes = {
    activeTab: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    busy: PropTypes.bool
};
