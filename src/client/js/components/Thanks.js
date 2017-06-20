import React, { Component } from 'react';
import { timerparams } from '../../../shared/timerconfig';

class Thanks extends Component {
  componentWillMount() {
    setTimeout(() => {
      window.location.replace(`${window.location.origin}/signup`);
    }, timerparams.modalTimeout);
  }

  render() {
    return (
      <div className="flex justify-center center-align">
        <div className="centered-message">
          <h2>Thanks!</h2>
          <p>Proceed to the Cashier to purchase a day pass.</p>
        </div>
      </div>
    );
  }
}

export default Thanks;
