import React, { Component } from 'react';
import Countries from 'react-select-country';
import { Redirect } from 'react-router-dom';
import Waiver from './Waiver';

const formInit = {
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  screenname: '',
  tried_oculus: false,
  tried_vive: false,
  tried_gear: false,
  country: '',
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
      [name]: value,
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    this.setState({ showWaiver: true });
  }

  handleWaiver(accept) {
    if (accept) {
      fetch('api/users', {
        method: 'post',
      }).then((res) => {
        console.log(res);
      }).catch((err) => {
        console.log('error', err);
      });
      return this.setState({ waiverAccepted: true });
    }

    this.clearForm();
    this.setState({ showWaiver: false });
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
        tried_oculus,
        tried_vive,
        tried_gear,
      },
    } = this.state;

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <div>
            <label htmlFor="firstname">First Name</label>
            <input
              type="text"
              name="firstname"
              id="firstname"
              value={firstname}
              placeholder="Name"
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
              placeholder="Last Name"
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
              placeholder="Email"
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
              placeholder="Phone"
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
              placeholder="Screen Name"
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

    if (waiverAccepted) {
      return (<Redirect to={{ pathname: '/signup/thanks' }} />);
    }

    return showWaiver
      ? <Waiver handleWaiver={this.handleWaiver} />
      : this.renderForm();
  }
}


export default SignupForm;
