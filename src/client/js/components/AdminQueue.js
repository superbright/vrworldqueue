import React, { Component } from 'react';

class AdminQueue extends Component {
  constructor() {
    super();

    this.state = {
      bay: null,
      queue: [],
    };

    this.fetchQueue = this.fetchQueue.bind(this);
    this.bumpUserUp = this.bumpUserUp.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
  }

  componentWillMount() {
    const { match: { params: { bayid } } } = this.props;
    this.fetchQueue();
    return fetch(`/api/bays/${bayid}`, {
      method: 'get',
    }).then(res => res.json()).then((bay) => {
      this.setState({
        bay,
      });
    }).catch((err) => {
      console.log('error', err);
    });
  }


  fetchQueue() {
    const { match: { params: { bayid } } } = this.props;

    return fetch(`/api/bays/${bayid}/queue`, {
      method: 'get',
    }).then(res => res.json()).then((queue) => {
      this.setState({ queue });
    }).catch((err) => {
      console.log('error', err);
    });
  }

  bumpUserUp(item) {
    const { match: { params: { bayid } } } = this.props;

    return fetch(`/api/bays/${bayid}/user`, {
      method: 'post',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(item),
    }).then(res => res.json()).then(() => {
      this.fetchQueue();
    }).catch((err) => {
      console.log('error', err);
    });
  }

  deleteUser(item) {
    const { match: { params: { bayid } } } = this.props;
console.log(item);
    return fetch(`/api/bays/${bayid}/user`, {
      method: 'delete',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(item),
    }).then(res => res.json()).then(() => {
        console.log('------fetch queue----');
      this.fetchQueue();
    }).catch((err) => {
      console.log('error', err);
    });
  }

  render() {
    const { queue, bay } = this.state;

    return (
      <div>
        <header className="flex space-between align-center">
          <h5>Bay {bay ? bay.name : ''} ADMIN</h5>
          <h5>{bay ? bay.game : ''}</h5>
        </header>
        {
          queue.length === 0
          ? (
            <div className="simple-container user-search">
              No one is in line.
            </div>
          )
          : (
            <ul> {
              queue.map(player => (
                <li
                  key={player.user._id}
                  className="user-list-item flex space-between align-center"
                >
                  <h5>{player.user.screenname}</h5>
                  <div>
                    <button onClick={() => this.bumpUserUp(player)}>Move To Top</button>
                    <button onClick={() => this.deleteUser(player)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )
        }
      </div>
    );
  }
}

export default AdminQueue;
