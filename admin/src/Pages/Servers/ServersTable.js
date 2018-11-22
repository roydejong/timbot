import React, {Component} from 'react';
import './ServersTable.css';
import PropTypes from 'prop-types';
import DeleteButton from "../../Common/DeleteButton";

export default class ServersTable extends Component {
    constructor(props) {
        super(props);
    }

    static getColumns() {
        let formatIcon = (iconUrl) => {
            if (!iconUrl) {
                return <div className={"ServersTable__no-img"}>?</div>;
            }

            return <img src={iconUrl} alt={"Server icon"} height={50} width={50} style={{ borderRadius: "50%" }}/>;
        };

        let formatTs = (ts) => {
            ts = parseInt(ts);

            if (!ts) {
                return "???";
            }

            let date = new Date(ts);
            return date.toDateString();
        };

        return {
            "icon": {
                "label": "",
                "format": formatIcon,
                "width": 50
            },
            "name": {
                "label": "Server"
            },
            "joined": {
                "label": "Joined",
                "format": formatTs
            },
            "members": {
                "label": "Members"
            },
            "owner_name": {
                "label": "Owner"
            }
        };
    }

    handleRowClick(row, e) {
        if (this.props.onServerClicked) {
            this.props.onServerClicked(row);
        }
    }

    handleRowDeleteClick(row, e) {
        this.props.onServerDelete(row);
    }

    render() {
        let columns = ServersTable.getColumns();

        return <table className="table table-hover table-bordered ServersTable">
            <thead className="thead-light">
            <tr>
                {Object.keys(columns).map((key) => {
                    let column = columns[key];
                    return <th scope="col" key={`th_${key}`}>{column.label}</th>;
                })}
                <th scope={"row"}>&nbsp;</th>
            </tr>
            </thead>
            {this.props.servers &&
                <tbody>
                {this.props.servers.map((row) => {
                    return <tr key={`server_${row.id}`}>
                        {Object.keys(columns).map((key) => {
                            let column = columns[key];
                            let value = row[key];

                            if (column.format) {
                                value = column.format(value, row);
                            }

                            return <td className={"ServersTable__col"} scope="col" key={`th_${key}`}
                                       onClick={this.handleRowClick.bind(this, row)}
                                       width={column.width || null}>{value}</td>;
                        })}
                        <td scope={"row"}>
                            <DeleteButton label={"Leave"} onDelete={this.handleRowDeleteClick.bind(this, row)}
                                          icon={<i className={"mdi mdi-exit-run"}/>}
                            />
                        </td>
                    </tr>
                })}
                </tbody>
            }
        </table>;
    }
}

ServersTable.propTypes = {
    servers: PropTypes.array.isRequired,
    onServerClicked: PropTypes.func.isRequired,
    onServerDelete: PropTypes.func.isRequired
};
