import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class BayList extends Component {
  constructor() {
    super();

    this.state = {
      bays: null,
    };
  }

  componentWillMount() {
    return fetch('/api/bays', {
      method: 'get',
    }).then(res => res.json()).then((bays) => {
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
              <li key={bay._id} className="user-list-item flex space-between align-center">
                <div><h5><Link to={`/bay/${bay._id}`}>{bay.name} - queue</Link></h5></div>
                <div><h5><Link to={`/bay/${bay._id}`}>play button page</Link></h5></div>
              </li>
            ))
          }
        </ul>
      </div>
    );
  }
}

export default BayList;
