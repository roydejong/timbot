import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './BehaviorOptionForm.css';

export default class BehaviorOptionForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            isComplete: false
        };
    }

    componentDidMount() {
        this.handleProps(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.handleProps(nextProps);
    }

    handleProps(props) {
        this.setState({
            data: { },
            isComplete: (!props.options || props.options.length === 0)
        });
    }

    handleInputChange(option, e) {
        const key = option.key;

        let nextValue = e.target.value || null;
        let nextData = this.state.data;

        console.log(key, nextValue);

        if (nextData[key] !== nextValue) {
            nextData[key] = nextValue;

            this.setState({
                data: nextData
            });

            this.checkCompletion();
        }
    }

    checkCompletion() {
        this.props.options.forEach((option) => {

        });
    }

    validate() {
        // if this was 720p I doubt you could read what I'm actually typing
    }

    render() {
        if (!this.props.options) {
            return <div className={"BehaviorOptionForm BehaviorOptionForm--blank"}>
                <p className={"text-secondary"}><i className={"mdi mdi-information-outline"}/> There are no configuration options for this {this.props.entityName.toLowerCase()}.</p>
            </div>;
        }

        let fields = this.props.options.map((option) => {
            let fKey = `option_${option.key}`;
            let fElement = (null);
            let fPlaceholder = option.required ? "Required" : "Optional";

            switch (option.type) {
                default:
                case "string":
                    fElement = <input className={"form-control"}
                                      type={"text"} id={fKey} name={fKey}
                                      onChange={this.handleInputChange.bind(this, option)}
                                      placeholder={fPlaceholder}/>;
                    break;

                case "boolean":
                    return <div className={"form-group-secondary"}>
                        <div className="form-check">
                            <input className="form-check-input"
                                   type="checkbox" id={fKey}
                                   onChange={this.handleInputChange.bind(this, option)}/>
                            <label className="form-check-label" htmlFor={fKey}>
                                {option.label}
                            </label>
                        </div>
                    </div>;
            }

            return <div className={"form-group"} key={fKey}>
                <label htmlFor={fKey}>{option.label}</label>
                {fElement}
            </div>;
        });

        return <div className={"BehaviorOptionForm"}>
            {fields}
        </div>;
    }
}

BehaviorOptionForm.propTypes = {
    options: PropTypes.array.isRequired,
    entityName: PropTypes.string.isRequired,
    onEntryChange: PropTypes.func.isRequired
};
