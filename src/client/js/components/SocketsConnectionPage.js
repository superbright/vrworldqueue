import React, { Component } from 'react';


class Bays extends Component {
  render() {
    const { match } = this.props;

    return (
      <div>
        <header className="flex space-between align-center">
          <h5>Socket connections</h5>
        </header>

        <ul>
          <li className="user-list-item flex space-between align-center">
            <h5>Admin User Page</h5>
            <p>Connected</p>
          </li>
          <li className="user-list-item flex space-between align-center">
            <h5>Bay Queue Page</h5>
            <p>Connected</p>
          </li>
        </ul>

      </div>
    )
  }
}

export default Bays;
