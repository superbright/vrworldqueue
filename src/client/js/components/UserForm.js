import React from 'react';
import FormGroup from './FormGroup';
import DatePicker from './DatePicker';
import countries from '../utils/countries';

const countryOptions = Object.keys(countries).map((code) => {
  return {
    label: countries[code],
    value: code
  };
});

const UserForm = ({
  handleChange,
  handleSubmit,
  form: {
    firstname,
    lastname,
    email,
    phone,
    screenname,
    gender = '',
    dob = {},
    address = {}
  },
  submitText,
  errors,
  twoButtons
}) => {
  address.city = address.city || '';
  address.country = address.country || '';

  return (
    <div>
      <form className="signup-form" onSubmit={handleSubmit}>
        {
          twoButtons
          &&
          <div className="form-group">
            <button>{submitText || 'Submit'}</button>
          </div>
        }

        <FormGroup
          value={firstname}
          valueID="firstname"
          valueName="First Name"
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

        <FormGroup
          value={address.city}
          valueID="address.city"
          valueName="Home City"
          errors={errors}
          handleChange={handleChange}
        />

        <FormGroup
          value={address.country}
          valueID="address.country"
          valueName="Home Country"
          type="select"
          errors={errors}
          handleChange={handleChange}
          options={{
            name: 'country',
            options: [{
              label: 'Select...',
              value: ''
            }, ...countryOptions]
          }}
        />

        <FormGroup
            value={gender}
            valueID="gender"
            valueName="Gender"
            type="select"
            errors={errors}
            handleChange={handleChange}
            options={{
              name: 'gender',
              options: [{
                label: 'Select...',
                value: ''
              }, {
                label: 'Male',
                value: 'male'
              }, {
                label: 'Female',
                value: 'female'
              }]
            }}
        />

        <DatePicker
          value={dob}
          handleChange={handleChange}
        />

        <p>* required</p>

        <div className="form-group">
          <button>{submitText || 'Submit'}</button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
