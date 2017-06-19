import React, { Component } from 'react';

class Thanks extends Component {
  componentWillMount() {
    setTimeout(() => {
      window.location.href = `${window.location.origin}/signup`;
    }, 4000);
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
