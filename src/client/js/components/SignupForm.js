import React, { Component } from 'react';
import Countries from 'react-select-country';
import { Redirect } from 'react-router-dom';

class SignupForm extends Component {
  constructor() {
    super();

    this.state = {
      form: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        handle: '',
        tried_oculus: false,
        tried_vive: false,
        tried_gear: false,
        country: '',
      },
      showWaiver: false,
      waiverAccepted: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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

    this.setState({ waiverAccepted: true });
  }

  render() {
    const { form: {
        first_name,
        last_name,
        email,
        phone,
        handle,
        tried_oculus,
        tried_vive,
        tried_gear,
      },
      waiverAccepted,
    } = this.state;

    return waiverAccepted
      ? <Redirect to={{ pathname: '/signup/thanks' }}/>
      : (
      <div>
        <form onSubmit={this.handleSubmit}>
          <div>
            <label htmlFor="first_name">First Name</label>
            <input
              type="text"
              name="first_name"
              id="first_name"
              value={first_name}
              placeholder="Name"
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input
              type="text"
              name="last_name"
              id="last_name"
              value={last_name}
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
              name="handle"
              id="handle"
              value={handle}
              placeholder="Screen Name"
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tried_vive">Tried Vive VR?</label>
            <input
              type="checkbox"
              name="tried_vive"
              id="tried_vive"
              checked={tried_vive}
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tried_oculus">Tried Oculus VR?</label>
            <input
              type="checkbox"
              name="tried_oculus"
              id="tried_oculus"
              checked={tried_oculus}
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tried_gear">Tried Gear VR?</label>
            <input
              type="checkbox"
              name="tried_gear"
              id="tried_gear"
              checked={tried_gear}
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <Countries
              id="country"
              name="country"
              empty=" -- Select country --"
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
}


export default SignupForm;
