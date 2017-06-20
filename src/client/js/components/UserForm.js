import React from 'react';
import FormGroup from './FormGroup';

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
      <FormGroup
        value={firstname}
        valueID="firstname"
        valueName="First Nam"
        errors={errors}
        handleChange={handleChange}
        required
      />

      <FormGroup
        value={lastname}
        valueID="lastname"
        valueName="Last Name"
        errors={errors}
        handleChange={handleChange}
        required
      />

      <FormGroup
        value={screenname}
        valueID="screenname"
        valueName="Screen Name"
        errors={errors}
        handleChange={handleChange}
        required
      />

      <FormGroup
        value={email}
        valueID="email"
        valueName="Email"
        errors={errors}
        handleChange={handleChange}
        required
      />

      <FormGroup
        value={phone}
        valueID="phone"
        valueName="Phone"
        errors={errors}
        handleChange={handleChange}
      />

      <p>* required</p>

      <div className="form-group">
        <button>{submitText || 'Submit'}</button>
      </div>
    </form>
  </div>
);

export default UserForm;
