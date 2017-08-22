import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

class AdminQueue extends Component {
  constructor() {
    super();

    this.state = {
      bay: null,
      queue: [],
      tempDelete: null,
      redirect: false,
      bayState: null,
    };

    this.fetchQueue = this.fetchQueue.bind(this);
    this.bumpUserUp = this.bumpUserUp.bind(this);
    this.tempDelete = this.tempDelete.bind(this);
    this.removeTempDelete = this.removeTempDelete.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.pauseGameplay = this.pauseGameplay.bind(this);
    this.resumeGameplay = this.resumeGameplay.bind(this);
  }

  componentWillMount() {
    const { match: { params: { bayid } } } = this.props;
    this.fetchQueue();
    return fetch(`/api/bays/${bayid}`, {
      method: 'get',
    }).then(res => res.json()).then((bay) => {
      this.setState({bay});
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

  pauseGameplay() {
    const { match: { params: { bayid } } } = this.props;

    return fetch(`/api/bays/${bayid}/pause`, {
      method: 'GET'
    }).then(res => res.json()).then((bay) => {
      this.setState({bay});
    });
  }

  resumeGameplay() {
    const { match: { params: { bayid } } } = this.props;

    return fetch(`/api/bays/${bayid}/resume`, {
      method: 'GET'
    }).then(res => res.json()).then((bay) => {
      this.setState({bay});
    });
  }

  tempDelete(item) {
    this.setState({ tempDelete: item });
  }

  removeTempDelete() {
    this.setState({ tempDelete: null });
  }

  deleteUser() {
    const { tempDelete } = this.state;
    const { match: { params: { bayid } } } = this.props;
    return fetch(`/api/bays/${bayid}/user`, {
      method: 'delete',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(tempDelete),
    }).then(res => res.json()).then(() => {
      this.setState({ tempDelete: null });
        
      this.fetchQueue();
    }).catch((err) => {
      console.log('error', err);
    });
  }

  render() {
    const { queue, bay, tempDelete, redirect } = this.state;
    const state = bay ? bay.currentState.state : 'idle';

    if (redirect) {
      return (<Redirect to={{ pathname: `/bay/${this.state.bay._id}` }} push />);
    }

    return (
      <div>
        <header className="flex space-between align-center">
          <h5>Bay {bay ? bay.name : ''} ADMIN</h5>
          <h5>{bay ? bay.game : ''}</h5>
        </header>
        <button onClick={() => this.setState({redirect: true})}>Back To Queue</button>
        {
          state === 'gameplay' &&
          (<button onClick={this.pauseGameplay}>Pause Game</button>)
        }
        {
          state === 'paused' &&
          (<button onClick={this.resumeGameplay}>Resume Game</button>)
        }
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
