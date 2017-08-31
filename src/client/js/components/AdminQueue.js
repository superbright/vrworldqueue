import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import io from 'socket.io-client';
import SocketConnectionStatus from './SocketConnectionStatus';

class AdminQueue extends Component {
  constructor() {
    super();

    this.state = {
      bay: null,
      socket: null,
      connected: false,
      fetching: false,
      queue: [],
      tempDelete: null,
      redirect: false,
      state: null,
    };

    this.connectSocket = this.connectSocket.bind(this);
    this.fetchQueue = this.fetchQueue.bind(this);
    this.bumpUserUp = this.bumpUserUp.bind(this);
    this.tempDelete = this.tempDelete.bind(this);
    this.removeTempDelete = this.removeTempDelete.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.pauseGameplay = this.pauseGameplay.bind(this);
    this.resumeGameplay = this.resumeGameplay.bind(this);
    this.toggleGameplay = this.toggleGameplay.bind(this);
    this.closeSocket = this.closeSocket.bind(this);
    this.handleBackToQueue = this.handleBackToQueue.bind(this);
  }

  componentWillMount() {
    const { match: { params: { bayid } } } = this.props;
    this.fetchQueue();
    fetch(`/api/bays/${bayid}`, {
      method: 'get',
    }).then(res => res.json()).then((bay) => {
      this.setState({
        bay,
        state: bay.currentState.state
      });
    }).catch((err) => {
      console.log('error', err);
    });

    this.setState({
      socket: io(window.location.origin, {
        query: `clientType=queueAdmin&clientId=${bayid}`
      }),
    }, () => this.connectSocket());
  }

  connectSocket() {
    const { socket } = this.state;
    if (socket) {
      socket.on('connect', () => {
        this.setState({connected: true});
      });
      socket.on('disconnect', () => {
        this.setState({connected: false});
      });
      socket.on('refresh', () => {
        location.reload();
      });
      socket.on('setState', (state) => {
        this.setState({state: state.state, fetching: false})
      })
    }
  }

  closeSocket() {
    const { match: { params: { bayid } } } = this.props;
    return fetch(`/api/sockets/`,{
      method: 'delete',
      body:JSON.stringify({clientType: 'queueAdmin', clientId: bayid}),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
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

  //@todo Legacy. Can update to use sockets.
  pauseGameplay() {
    const { match: { params: { bayid } } } = this.props;

    return fetch(`/api/bays/${bayid}/pause`, {
      method: 'GET'
    }).then(res => res.json()).then((bay) => {
      this.setState({
        bay,
        state: bay.currentState.state
      });
    });
  }

  //@todo Legacy. Can update to use sockets.
  resumeGameplay() {
    const { match: { params: { bayid } } } = this.props;

    return fetch(`/api/bays/${bayid}/resume`, {
      method: 'GET'
    }).then(res => res.json()).then((bay) => {
      this.setState({
        bay,
        state: bay.currentState.state
      });
    });
  }

  toggleGameplay(start = true) {
    const { match: { params: { bayid } } } = this.props;
    const event = start ? 'startButton' : 'endButton';

    if (!this.state.fetching) {
      this.setState({ fetching: true });
      this.state.socket.emit(event, {
        clientId: bayid
      });
    }
  }

  handleBackToQueue() {
    this.closeSocket().then(() => this.setState({redirect: true}));
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
    const { queue, bay, tempDelete, redirect, connected, state } = this.state;

    if (redirect) {
      return (<Redirect to={{ pathname: `/bay/${this.state.bay._id}` }} push />);
    }

    return (
      <div>
        <header className="flex space-between align-center">
          <h5>Bay {bay ? bay.name : ''} ADMIN</h5>
          <h5>{bay ? bay.game : ''}</h5>
        </header>
        <div className="admin-button-container">
          <div>
            <button onClick={this.handleBackToQueue}>Back To Queue</button>
          </div>
          {
            state === 'idle' &&
            (
              <div>
                <button onClick={this.toggleGameplay}>Start Game</button>
              </div>
            )
          }
          {
            (state === 'gameplay' || state === 'paused') &&
            (
              <div>
                <button onClick={() => this.toggleGameplay(false)}>End Game</button>
              </div>
            )
          }
          {
            state === 'gameplay' &&
            (
              <div>
                <button onClick={this.pauseGameplay}>Pause Game</button>
              </div>
            )
          }
          {
            state === 'paused' &&
            (
              <div>
                <button onClick={this.resumeGameplay}>Resume Game</button>
              </div>
            )
          }
        </div>
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
        <SocketConnectionStatus connected={connected} />
      </div>
    );
  }
}

export default AdminQueue;
