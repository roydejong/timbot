import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './Modal.css';

export default class Modal extends Component {
    render() {
        return (
            <div className={"Modal"}>
                <div className="modal show" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            {this.props.showHeader &&
                            <div className="modal-header">
                                <h5 className="modal-title">{this.props.icon || null} {this.props.title}</h5>
                                {this.props.canDismiss &&
                                <button type="button" className="close" title={this.props.dismissLabel}>
                                    <span>&times;</span>
                                </button>
                                }
                            </div>
                            }
                            <div className="modal-body">
                                {this.props.children}
                            </div>
                            <div className="modal-footer">
                                {this.props.canDismiss &&
                                <button type="button" className="btn btn-secondary"
                                        onClick={this.props.onDismiss}>{this.props.dismissLabel}</button>
                                }
                                <button type="button" className="btn btn-primary" disabled={!this.props.canConfirm}
                                        onClick={this.props.onConfirm}>{this.props.confirmLabel}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Modal.defaultProps = {
    showHeader: true,
    canDismiss: true,
    dismissLabel: "Cancel",
    confirmLabel: "OK"
};

Modal.propTypes = {
    title: PropTypes.string,
    showHeader: PropTypes.bool,

    canDismiss: PropTypes.bool,
    onDismiss: PropTypes.func,
    dismissLabel: PropTypes.string,

    canConfirm: PropTypes.bool,
    onConfirm: PropTypes.func,
    confirmLabel: PropTypes.string,

    icon: PropTypes.any
};
