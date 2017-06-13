import React from 'react';

const Waiver = ({ handleWaiver }) => (
  <div className="waiver flex justify-center center-align">
    <div className="centered-message">
      <h2>Do you agree to the Terms and Conditions?</h2>
      <div className="flex justify-center">
        <button onClick={() => handleWaiver(true)}>YES</button>
        <button onClick={() => handleWaiver(false)}>NO</button>
      </div>
    </div>
  </div>
);

export default Waiver;
