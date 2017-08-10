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
  handleNameBlur,
  form: {
    firstname,
    lastname,
    email,
    phone,
    screenname,
    gender = '',
    dob = {},
    address = {},
    timer = '',
    source = '',
  },
  submitText,
  errors,
  twoButtons,
  admin
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

        {
          admin &&
          <FormGroup
            value={timer}
            valueID="timer"
            valueName="Time"
            type="select"
            errors={errors}
            handleChange={handleChange}
            options={{
            name: 'timer',
            options: [{
              label: 'Day',
              value: ''
            }, {
              label: '1 Hour',
              value: '1'
            }, {
              label: '3 Hours',
              value: '3'
            }]
          }}
          />
        }

        <p>* required</p>

        <FormGroup
          value={firstname}
          valueID="firstname"
          valueName="First Name"
          errors={errors}
          handleChange={handleChange}
          handleBlur={handleNameBlur}
          required
        />

        <FormGroup
          value={lastname}
          valueID="lastname"
          valueName="Last Name"
          errors={errors}
          handleChange={handleChange}
          handleBlur={handleNameBlur}
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
          value={screenname}
          valueID="screenname"
          valueName="Screen Name"
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

        <DatePicker
          value={dob}
          handleChange={handleChange}
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
            }, {
                label: 'Other',
                value: 'other'
            }]
          }}
        />

        <FormGroup
          value={source}
          valueID="source"
          valueName="How Did You Hear About Us?"
          type="select"
          errors={errors}
          handleChange={handleChange}
          required
          options={{
            name: 'source',
            options: [{
              label: 'Select...',
              value: ''
            }, {
              label: 'Word of Mouth / Friends',
              value: 'Word of Mouth / Friends'
            }, {
              label: 'Walk-in',
              value: 'Walk-in'
            }, {
              label: 'Online Search',
              value: 'Online Search'
            }, {
              label: 'Yelp',
              value: 'Yelp'
            }, {
              label: 'Google Reviews',
              value: 'Google Reviews'
            }, {
              label: 'TripAdvisor',
              value: 'TripAdvisor'
            }, {
              label: 'Instagram',
              value: 'Instagram'
            }, {
              label: 'Facebook',
              value: 'Facebook'
            }, {
              label: 'TV Ads',
              value: 'TV Ads'
            }, {
              label: 'Online Media',
              value: 'Online Media'
            }, {
              label: 'Other',
              value: 'Other'
            }]
          }}
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