import React, {Component} from 'react';
import './ReactionsPage.css';
import PropTypes from 'prop-types';

export default class ReactionsTable extends Component {
    constructor(props) {
        super(props);
    }

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

    render() {
        let columns = ReactionsTable.getColumns();

        return <table className="table table-hover table-bordered">
            <thead className="thead-light">
            <tr>
                {Object.keys(columns).map((key) => {
                    let column = columns[key];
                    return <th scope="col" key={`th_${key}`}>{column.label}</th>;
                })}
            </tr>
            </thead>
            {this.props.reactions &&
                <tbody>
                {this.props.reactions.map((row) => {
                    return <tr key={`reaction_${row.id}`} onClick={() => { this.props.onReactionClicked(row); }}>
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

                            return <td scope="col" key={`th_${key}`}>{value}</td>;
                        })}
                    </tr>
                })}
                </tbody>
            }
        </table>;
    }
}

ReactionsTable.propTypes = {
    reactions: PropTypes.array.isRequired,
    onReactionClicked: PropTypes.func.isRequired
};
