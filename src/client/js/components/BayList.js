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
          <li key='bay-header' className="user-list-item bay-list-item flex space-between align-center">
            <div className="bay-list-name">
              <p>Bay Name</p>
            </div>

            <div className="bay-list-count">
              User Count
            </div>

            <div className="bay-list-state">
              Play State
            </div>
          </li>
          {
            bays &&
            bays.sort((a, b) => a.id - b.id).map(bay => (
              <li key={bay._id} className="user-list-item bay-list-item flex space-between align-center">
                <div className="bay-list-name">
                  <h5><Link to={`/bay/${bay._id}`}>{bay.name} - {bay.game}</Link></h5>
                  <p><Link to={`/bay/${bay._id}/play`}>play button page</Link></p>
                  <p><Link to={`/admin/queue/${bay._id}`}>queue admin</Link></p>
                </div>

                <div className="bay-list-count">
                  0
                </div>

                <div className="bay-list-state">
                  {bay.currentState.state}
                </div>
              </li>
            ))
          }
        </ul>
      </div>
    );
  }
}

export default BayList;
