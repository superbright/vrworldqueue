import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Waiver from './Waiver';

const formInit = {
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  screenname: '',
};

class SignupForm extends Component {
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
    this.renderForm = this.renderForm.bind(this);
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

  renderForm() {
    const { form: {
        firstname,
        lastname,
        email,
        phone,
        screenname,
      },
    } = this.state;

    return (
      <div className="simple-container">
        <header className="flex space-between align-center">
          <h5>Sign Up</h5>
        </header>

        <form className="signup-form" onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstname">First Name</label>
            <input
              type="text"
              name="firstname"
              id="firstname"
              value={firstname}
              required
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastname">Last Name</label>
            <input
              type="text"
              name="lastname"
              id="lastname"
              value={lastname}
              required
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              name="email"
              id="email"
              value={email}
              required
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="text"
              name="phone"
              id="phone"
              value={phone}
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="handle">Screen Name</label>
            <input
              type="text"
              name="screenname"
              id="screenname"
              value={screenname}
              required
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group">
            <button>Submit</button>
          </div>
        </form>
      </div>
    );
  }

  render() {
    const {
      showWaiver,
      waiverAccepted,
    } = this.state;
    console.log('here');
    if (waiverAccepted) {
      console.log('waiverAccepted');
      return (<Redirect to={{ pathname: '/signup/thanks' }} />);
    }

    return showWaiver
      ? <Waiver handleWaiver={this.handleWaiver} />
      : this.renderForm();
  }
}


export default SignupForm;
