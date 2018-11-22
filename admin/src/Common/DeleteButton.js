import React, {Component} from 'react';
import './DeleteButton.css';
import PropTypes from 'prop-types';

export default class DeleteButton extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isConfirming: false,
            isFinalized: false
        };
    }

    handleClick(e) {
        e.preventDefault();

        if (this.state.isConfirming) {
            this.setState({
                isConfirming: false,
                isFinalized: true
            });

            let result = this.props.onDelete();

            if (result === false) {
                this.setState({
                    isConfirming: false,
                    isFinalized: false
                });
            }
        } else {
            if (this.didRenderNormal) {
                if (this.cancelTimeout) {
                    clearTimeout(this.cancelTimeout);
                    this.cancelTimeout = null;
                }

                this.setState({
                    isConfirming: true
                });

                this.cancelTimeout = setTimeout(this.handleCancel.bind(this), 3500);
            }
        }

        return false;
    }

    handleCancel() {
        this.setState({
            isConfirming: false
        });
    }

    componentWillUnmount() {
        if (this.cancelTimeout) {
            clearTimeout(this.cancelTimeout);
            this.cancelTimeout = null;
        }
    }

    render() {
        let classNames = [];
        let faceLabel = this.props.label;
        let icon = this.props.icon || <i className={"mdi mdi-delete"}/>;
        let isDisabled = false;

        classNames.push("btn");
        classNames.push("DeleteButton");

        this.didRenderNormal = false;

        if (this.state.isFinalized) {
            classNames.push("DeleteButton--busy");
            classNames.push("btn-disabled");

            faceLabel = "";

            icon = <i className={"mdi mdi-loading"}/>;
        } else if (this.state.isConfirming) {
            classNames.push("btn-danger");
            classNames.push("DeleteButton--confirm");

            faceLabel = "Confirm?";

            icon = <i className={"mdi mdi-question"}/>;

        } else {
            classNames.push("btn-outline-danger");

            this.didRenderNormal = true;
        }

        return (
            <a href={"#"} title={this.props.label} className={classNames.join(' ')} onClick={this.handleClick.bind(this)}>
                {icon}
                <span>{faceLabel}</span>
            </a>
        );
    }
}

DeleteButton.defaultProps = {
    label: "Delete"
};

DeleteButton.propTypes = {
    label: PropTypes.string,
    onDelete: PropTypes.func.isRequired,
    icon: PropTypes.any
};
