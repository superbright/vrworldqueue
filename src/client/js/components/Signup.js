import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import validate from 'validate.js';
import Waiver from './Waiver';
import UserForm from './UserForm';
import formConstraints from '../utils/formConstraints';
import Spinner from 'react-spin';
import config from '../utils/spinnerConfig';

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
      waiverFetching: false,
      errors: null,
      fetching: false,
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

    const errors = validate(this.state.form, formConstraints);

    if (errors) {
      return this.setState({ errors });
    }
    this.setState({ fetching: true });
    fetch(`/api/users/screenname/${this.state.form.screenname}`, {
      method: 'post',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    }).then(res => res.json()).then((res) => {
      if (res.error) {
        return this.setState({ errors: { screenname: res.error }, fetching: false});
      }
      return this.setState({ showWaiver: true, fetching: false });
    }).catch((err) => {
      console.log('error', err);
    });
  }

  handleWaiver(accept) {
    if (accept) {
      this.setState({ waiverFetching: true });
      const { form } = this.state;

      fetch('/api/users', {
        method: 'post',
        body: JSON.stringify({ ...form, phone: form.phone.replace(/\D/g,''), createdAt: new Date() }),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      }).then(res => res.json()).then(() => {
        this.setState({ waiverAccepted: true, waiverFetching: false });
      }).catch((err) => {
        console.log('error', err);
      });
    } else {
      this.clearForm();
      this.setState({ showWaiver: false, errors: null });
    }
  }

  clearForm() {
    this.setState({ form: formInit, errors: null });
  }

  render() {
    const {
      showWaiver,
      waiverAccepted,
      form,
      waiverFetching,
      errors,
      fetching,
    } = this.state;

    if (waiverAccepted) {
      return (<Redirect to={{ pathname: '/signup/thanks' }} />);
    }

    return showWaiver
      ? <Waiver handleWaiver={this.handleWaiver} waiverFetching={waiverFetching} />
      : <div className="simple-container">
        <header className="flex space-between align-center">
          <img className="logo" src="/images/vrworld.png" />
        </header>
        {
          fetching
          ? <Spinner config={config} />
          : (<UserForm
            form={form}
            handleSubmit={this.handleSubmit}
            handleChange={this.handleChange}
            errors={errors}
          />)
        }

      </div>;
  }
}


export default Signup;
