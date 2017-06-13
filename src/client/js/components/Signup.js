import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Waiver from './Waiver';
import UserForm from './UserForm';

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
      }
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
      form,
    } = this.state;

    if (waiverAccepted) {
      return (<Redirect to={{ pathname: '/signup/thanks' }} />);
    }

    return showWaiver
      ? <Waiver handleWaiver={this.handleWaiver} />
      : <div className="simple-container"><UserForm form={form} handleSubmit={this.handleSubmit} handleChange={this.handleChange} /></div>;
  }
}


export default Signup;
