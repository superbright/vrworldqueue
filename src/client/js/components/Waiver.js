import React, { Component } from 'react';

class Waiver extends Component {
  render() {
    const { handleWaiver } = this.props;
    return (
      <div>
        Waiver

        <button onClick={() => handleWaiver(true)}>YES</button>
        <button onClick={() => handleWaiver(false)}>NO</button>
      </div>
    )
  }
}

export default Waiver;
