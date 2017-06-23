import React, { Component } from 'react';

class AdminQueue extends Component {
  constructor() {
    super();

    this.state = {
      bay: null,
      queue: [],
      tempDelete: null,
    };

    this.fetchQueue = this.fetchQueue.bind(this);
    this.bumpUserUp = this.bumpUserUp.bind(this);
    this.tempDelete = this.tempDelete.bind(this);
    this.removeTempDelete = this.removeTempDelete.bind(this);
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
      body: JSON.stringify(item),
    }).then(res => res.json()).then(() => {
      this.fetchQueue();
    }).catch((err) => {
      console.log('error', err);
    });
  }

  tempDelete(item) {
    this.setState({ tempDelete: item });
  }

  removeTempDelete() {
    this.setState({ tempDelete: null });
  }

  deleteUser() {
    const { tempDelete } = this.props;
    const { match: { params: { bayid } } } = this.props;

    return fetch(`/api/bays/${bayid}/user`, {
      method: 'delete',
      body: JSON.stringify(tempDelete),
    }).then(res => res.json()).then(() => {
      this.setState({ tempDelete: null });
      this.fetchQueue();
    }).catch((err) => {
      console.log('error', err);
    });
  }

  render() {
    const { queue, bay, tempDelete } = this.state;

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
                    <button onClick={() => this.tempDelete(player)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )
        }

        {
          tempDelete &&
          (<div className="modal flex justify-center align-center modal-error" >
            <div className="modal-container">
              <div>
                <h2>Are you sure you want to Delete {tempDelete.user.screenname}?</h2>
                <div>
                  <button className="button-white" onClick={this.deleteUser}>YES</button>
                  <button className="button-white" onClick={this.removeTempDelete}>NO</button>
                </div>
              </div>
            </div>
          </div>)
        }
      </div>
    );
  }
}

export default AdminQueue;
