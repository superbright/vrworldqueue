import React from 'react';

const UserForm = ({
  handleChange,
  handleSubmit,
  form: {
    firstname,
    lastname,
    email,
    phone,
    screenname,
  },
  submitText,
}) => (
  <div>
    <form className="signup-form" onSubmit={handleSubmit}>
      {
        (firstname || firstname === '') &&
        <div className="form-group">
          <label htmlFor="firstname">First Name <span className="small-font">*</span></label>
          <input
            type="text"
            name="firstname"
            id="firstname"
            value={firstname}
            required
            onChange={handleChange}
          />
          <div className="error-message"></div>
        </div>
      }

      {
        (lastname || lastname === '') &&
        <div className="form-group">
          <label htmlFor="lastname">Last Name <span className="small-font">*</span></label>
          <input
            type="text"
            name="lastname"
            id="lastname"
            value={lastname}
            required
            onChange={handleChange}
          />
        </div>
      }

      {
        (email || email === '') &&
        <div className="form-group">
          <label htmlFor="email">Email <span className="small-font">*</span></label>
          <input
            type="text"
            name="email"
            id="email"
            value={email}
            required
            onChange={handleChange}
          />
        </div>
      }

      {
        (phone || phone === '') &&
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="text"
            name="phone"
            id="phone"
            value={phone}
            onChange={handleChange}
          />
        </div>
      }

      {
        (screenname || screenname === '') &&
        <div className="form-group">
          <label htmlFor="handle">Screen Name <span className="small-font">*</span></label>
          <input
            type="text"
            name="screenname"
            id="screenname"
            value={screenname}
            required
            onChange={handleChange}
          />
        </div>
      }

      <p>* required</p>

      <div className="form-group">
        <button>{submitText || 'Submit'}</button>
      </div>
    </form>
  </div>
)

export default UserForm;
