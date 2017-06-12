import React from 'react';

const SignupForm = ({
  form: {
    firstname,
    lastname,
    email,
    phone,
    screenname,
  },
  handleSubmit,
  handleChange,
}) => (
  <div className="signup-form simple-container">
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="firstname">First Name</label>
        <input
          type="text"
          name="firstname"
          id="firstname"
          value={firstname}
          placeholder="Name"
          onChange={handleChange}
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
          onChange={handleChange}
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
          onChange={handleChange}
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
          onChange={handleChange}
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
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <button>Submit</button>
      </div>
    </form>
  </div>
);

export default SignupForm;
