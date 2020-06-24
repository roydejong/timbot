import React, {Component} from 'react';
import './ReactionsTable.css';
import PropTypes from 'prop-types';
import DeleteButton from "../../Common/DeleteButton";

export default class ReactionsTable extends Component {
    static getColumns() {
        // let formatTriggerType = (val) => {
        //     return ReactionEdit.TYPES[val] || `Unknown (${val})`;
        // };

        let formatBool = (val) => {
            if (val === true || val === "true" || val === 1 || val === "1") {
                return "Yes";
            }

            return "No";
        };

        let formatRawCode = (val) => {
            return <code>{val}</code>
        };

        return {
            "id": {
                "label": "#"
            },
            "type": {
                "label": "Type",
                "format": formatRawCode
            },
            "trigger": {
                "label": "Trigger"
            },
            "must_mention": {
                "label": "Must mention?",
                "format": formatBool
            },
            "insensitive": {
                "label": "Insensitive?",
                "format": formatBool
            },
            "response": {
                "label": "Response"
            },
            "emote": {
                "label": "Emote",
                "format": formatRawCode
            }
        };
    }

    handleRowClick(row, e) {
        this.props.onReactionClicked(row);
    }

    handleRowDeleteClick(row, e) {
        this.props.onReactionDelete(row);
    }

    render() {
        let columns = ReactionsTable.getColumns();

        return <table className="table table-hover table-bordered ReactionsTable">
            <thead className="thead-light">
            <tr>
                {Object.keys(columns).map((key) => {
                    let column = columns[key];
                    return <th scope="col" key={`th_${key}`}>{column.label}</th>;
                })}
                <th scope={"row"}>&nbsp;</th>
            </tr>
            </thead>
            {this.props.reactions &&
                <tbody>
                {this.props.reactions.map((row) => {
                    return <tr key={`reaction_${row.id}`}>
                        {Object.keys(columns).map((key) => {
                            let column = columns[key];
                            let value = row[key];

                            if (typeof value !== "undefined" && value !== null && value !== "") {
                                if (column.format) {
                                    value = column.format(value, row);
                                }
                            } else {
                                value = "-";
                            }

                            return <td className={"ReactionsTable__col"} scope="col" key={`th_${key}`} onClick={this.handleRowClick.bind(this, row)}>{value}</td>;
                        })}
                        <td scope={"row"}>
                            <DeleteButton onDelete={this.handleRowDeleteClick.bind(this, row)}/>
                        </td>
                    </tr>
                })}
                </tbody>
            }
        </table>;
    }
}

ReactionsTable.propTypes = {
    reactions: PropTypes.array.isRequired,
    onReactionClicked: PropTypes.func.isRequired,
    onReactionDelete: PropTypes.func.isRequired
};
