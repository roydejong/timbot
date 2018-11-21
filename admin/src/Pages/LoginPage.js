import React, {Component} from 'react';
import AppPage from "../Base/AppPage";
import "./LoginPage.css";
import ApiRequest from "../Api/ApiRequest";
import ApiClient from "../Api/ApiClient";

export default class LoginPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tryingLogin: false,
            passwordValue: "",
            didError: false
        };
    }

    componentDidMount() {
        ApiClient.subscribe("LoginPage_result", ApiClient.OP_LOGIN, this.handleLoginState.bind(this));
    }

    componentWillUnmount() {
        ApiClient.unsubscribe("LoginPage_result");
    }

    handleSubmit() {
        if (this.state.tryingLogin) {
            return;
        }

        this.setState({
            tryingLogin: true
        });

        new ApiRequest({
            op: "login",
            password: this.state.passwordValue
        })
            .send()
            .catch((e) => { })
    }

    handleLoginState(result) {
        if (!result.ok) {
            setTimeout(() => {
                this.setState({
                    tryingLogin: false,
                    passwordValue: "",
                    didError: true
                });
            }, 1000);
        } else {
            this.setState({
                tryingLogin: false,
                didError: false
            });
        }
    }

    handlePasswordChange(e) {
        this.setState({
            passwordValue: e.target.value || "",
            didError: false
        });
    }

    render() {
        return (
            <AppPage enableNav={false} title={"Login"} busy={this.state.tryingLogin}>
                <div className={"container"}>
                    <div className={"LoginPage"}>
                        <p><i className={"mdi mdi-lock"}/> To access the admin panel, enter the password below:</p>
                        <div className={"form-group"}>
                            <input type={"password"} className={"form-control " + (this.state.didError ? "is-invalid" : "")}
                                   placeholder={this.state.didError ? "Invalid password / login error" : "Enter admin password"}
                                   value={this.state.passwordValue} onChange={this.handlePasswordChange.bind(this)}
                                   disabled={this.state.tryingLogin}
                            />
                        </div>
                        <button type={"submit"} className={"btn btn-primary"} onClick={this.handleSubmit.bind(this)}
                                disabled={this.state.tryingLogin || !this.state.passwordValue || this.state.didError}>
                            <i className={"mdi mdi-check"}/>&nbsp;
                            <span>Submit</span>
                        </button>
                    </div>
                </div>
            </AppPage>
        );
    }
}

LoginPage.propTypes = {

};
