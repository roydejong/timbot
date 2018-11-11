import React, { Component } from 'react';
import './NavbarItem.css';
import PropTypes from 'prop-types';

export default class NavbarItem extends Component {
    render() {
        let classNames = ["nav-item"];

        if (this.props.active) {
            classNames.push("active");
        }

        return (
            <li className={classNames.join(' ')}>
                <a className="nav-link" href={"##"}>
                    {this.props.title}
                    {this.props.active && <span className="sr-only">(current)</span>}
                </a>
            </li>
        );
    }
}

NavbarItem.propTypes = {
    active: PropTypes.bool,
    title: PropTypes.string.isRequired
};
