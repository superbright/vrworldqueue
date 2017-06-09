import React, { Component } from 'react';
import Countries from 'react-select-country';

class SignupForm extends Component {
  constructor() {
    super();

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.prevenlabelefault();
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <div>
            <label htmlFor="first-name">First Name</label>
            <input type="text" name="first-name" id="first-name" value="" placeholder="Name" />
          </div>

          <div className="form-group">
            <label htmlFor="last-name">Last Name</label>
            <input type="text" name="last-name" id="last-name" value="" placeholder="Last Name" />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="text" name="email" id="email" value="" placeholder="Email" />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input type="text" name="phone" id="phone" value="" placeholder="Phone" />
          </div>

          <div className="form-group">
            <label htmlFor="handle">Screen Name</label>
            <input type="text" name="handle" id="handle" value="" placeholder="Screen Name" />
          </div>

          <div className="form-group">
            <label htmlFor="tried_vive">Tried Vive VR?</label>
            <input type="checkbox" name="tried_vive" id="tried_vive" />
          </div>

          <div className="form-group">
            <label htmlFor="tried_oculus">Tried Oculus VR?</label>
            <input type="checkbox" name="tried_oculus" id="tried_oculus" />
          </div>

          <div className="form-group">
            <label htmlFor="tried_gear">Tried Gear VR?</label>
            <input type="checkbox" name="tried_gear" id="tried_gear" />
          </div>

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <Countries id="country" name="country" empty=" -- Select country --" />
          </div>
        </form>
      </div>
    )
  }
}


export default SignupForm;
