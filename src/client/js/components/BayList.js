import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class BayList extends Component {
  constructor() {
    super();

    this.state = {
      bays: null,
    }
  }

  componentWillMount() {
    return fetch(`/api/bays`, {
      method: 'get',
    }).then(res => res.json()).then((bays) => {
      console.log(bays);
      this.setState({ bays });
    }).catch((err) => {
      console.log('error', err);
    });
  }

  render() {
    const { bays } = this.state;

    return (
      <div>
        <ul>
          {
            bays &&
            bays.map(bay => (
              <li className="user-list-item flex space-between align-center">
                <div><h2><Link to={`/bay/${bay._id}`}>{bay.name}</Link></h2></div>
              </li>
            ))
          }
        </ul>
      </div>
    );
  }
}

export default BayList;
