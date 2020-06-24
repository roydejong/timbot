import React from 'react';
import './NavbarItem.css';
import PropTypes from 'prop-types';
import {Link} from "react-router-dom";

export default class NavbarItem extends React.PureComponent {
    render() {
        let classNames = ["nav-item NavbarItem"];

        if (this.props.active) {
            classNames.push("active");
        }

        return (
            <li className={classNames.join(' ')}>
                <Link className="nav-link" to={this.props.href}>
                    {this.props.icon || null}
                    {this.props.title}
                    {this.props.active && <span className="sr-only">(current)</span>}
                </Link>
            </li>
        );
    }
}

NavbarItem.propTypes = {
    active: PropTypes.bool,
    href: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    icon: PropTypes.any
};
