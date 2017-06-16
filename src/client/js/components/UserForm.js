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
  errors,
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
          {errors && errors.firstname && <div className="error-message">{errors.firstname}</div>}
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
          {errors && errors.lastname && <div className="error-message">{errors.lastname}</div>}
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
          {errors && errors.email && <div className="error-message">{errors.email}</div>}
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
          {errors && errors.phone && <div className="error-message">{errors.phone}</div>}
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
          {errors && errors.screenname && <div className="error-message">{errors.screenname}</div>}
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
