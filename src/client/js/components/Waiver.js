import React, { Component } from 'react';

class Waiver extends Component {
  constructor() {
    super();

    this.agree = this.agree.bind(this);
    this.returnToForm = this.returnToForm.bind(this);
  }

  agree() {
    console.log('agree');
  }

  returnToForm() {
    console.log('disagree');
  }

  render() {
    return (
      <div>
        Waiver

        <button onClick={this.agree}>YES</button>
        <button onClick={this.returnToForm}>NO</button>
      </div>
    )
  }
}

export default Waiver;
