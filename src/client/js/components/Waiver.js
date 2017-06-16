import React from 'react';
import Spinner from 'react-spin';
import config from '../utils/spinnerConfig';
import terms from '../utils/terms';

const Waiver = ({ handleWaiver, waiverFetching }) => (
  <div className="waiver flex justify-center center-align">
    <div className="centered-message">
      <h2>Do you agree to the Terms and Conditions?</h2>
      <div className="terms">{terms}</div>
      {
        waiverFetching
        ? (
          <div className="flex justify-center">
            <Spinner config={config} />
          </div>
        )
        : (
          <div className="flex justify-center">
            <button onClick={() => handleWaiver(true)}>YES</button>
            <button onClick={() => handleWaiver(false)}>NO</button>
          </div>
        )
      }
    </div>
  </div>
);

export default Waiver;
