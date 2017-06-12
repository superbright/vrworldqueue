import React, { Component } from 'react';
import { Redirect, Route } from 'react-router-dom';
import SignupForm from './SignupForm';
import Waiver from './Waiver';
import Thanks from './Thanks';

const formInit = {
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  screenname: '',
};

class Signup extends Component {
  constructor() {
    super();

    this.state = {
      form: formInit,
      showWaiver: false,
      waiverAccepted: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleWaiver = this.handleWaiver.bind(this);
    this.clearForm = this.clearForm.bind(this);
  }

  handleChange(event) {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      form: {
        ...this.state.form,
        [name]: value,
      },
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    this.setState({ showWaiver: true });
  }

  handleWaiver(accept) {
    if (accept) {
      fetch('/api/users', {
        method: 'post',
        body: JSON.stringify(this.state.form),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      }).then(res => res.json()).then(() => {
        this.setState({ waiverAccepted: true });
      }).catch((err) => {
        console.log('error', err);
      });
    } else {
      this.clearForm();
      this.setState({ showWaiver: false });
    }
  }

  clearForm() {
    this.setState({ form: formInit });
  }

  render() {
    const {
      showWaiver,
      waiverAccepted,
    } = this.state;
    const { match } = this.props;

    return (
      <div>
        <header className="flex space-between align-center">
          <h5>Sign up</h5>
        </header>

        <Route
          exact
          path={`${match.url}/`}
          component={props => (<SignupForm
            {...props}
            form={this.state.form}
            handleChange={this.handleChange}
            handleSubmit={this.handleSubmit}
          />)}
        />
      </div>
    );
  }
}


        //
        // {showWaiver && !waiverAccepted && <Redirect to={{ pathname: '/signup/waiver' }} />}
        // {waiverAccepted && <Redirect to={{ pathname: '/signup/thanks' }} />}
        //
        // <Route
        //   exact
        //   path="/thanks"
        //   component={props => <Thanks {...props} />}
        // />
        // <Route
        //   exact
        //   path="/waiver"
        //   component={props => <Waiver {...props} />}
        // />

export default Signup;
