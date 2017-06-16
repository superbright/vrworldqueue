import React, { Component } from 'react';
import io from 'socket.io-client';

class Bay extends Component {
  constructor() {
    super();
    this.state = {
      bay: null,
      socket: null,
      queue: [],
      showModal: false,
      isErrorModal: false,
      userAttempt: null,
    };

    this.connectSocket = this.connectSocket.bind(this);
    this.fetchQueue = this.fetchQueue.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.confirmUser = this.confirmUser.bind(this);
  }

  componentWillMount() {
    const { match: { params: { bayid } } } = this.props;

    return fetch(`/api/bays/${bayid}`, {
      method: 'get',
    }).then(res => res.json()).then((bay) => {
      this.setState({
        bay,
        socket: io(window.location.origin, {
          query: `clientType=queue&clientId=${bayid}`,
        }),
      });

      this.connectSocket();
      this.fetchQueue();
    }).catch((err) => {
      console.log('error', err);
    });
  }

  fetchQueue() {
    const { match: { params: { bayid } } } = this.props;

    return fetch(`/api/bays/${bayid}/queue`, {
      method: 'get',
    }).then(res => res.json()).then((queue) => {
      console.log('fetching queue', queue);
      this.setState({ queue });
    }).catch((err) => {
      console.log('error', err);
    });
  }

  connectSocket() {
    const { socket } = this.state;
    if (socket) {
      socket.on('queue', (res) => {
        this.setState({ queue: res });
      });
      socket.on('userattempt', (res) => {
        console.log('userAttempt', res);

        this.setState({ userAttempt: res, showModal: true });
      });
    }
  }

  closeModal() {
    const { showModal, userAttempt } = this.state;
    this.setState({ showModal: !showModal, userAttempt: showModal ? null : userAttempt });
  }

  confirmUser() {
    const { userAttempt: { data: { user } } } = this.state;
    const { match: { params: { bayid } } } = this.props;

    fetch(`/api/bays/${bayid}/enqueue`, {
      method: 'post',
      body: JSON.stringify({ userId: user._id }),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    }).then(res => res.json()).then((res) => {
      this.setState({ queue: res });
      this.closeModal();
    }).catch((err) => {
      console.log('error', err);
    });
  }

  render() {
    const { bay, queue, showModal, isErrorModal } = this.state;
    const { match: { params: { bayid } } } = this.props;

    return (
      <div key={bayid}>
        {
          bay && (
            <div>
              <header className="flex space-between align-center">
                <h5>{bay.name}</h5>
              </header>
              {
                queue.length === 0
                ? (
                  <div className="simple-container user-search">
                    <h3>{'There\'s no one in line, register now!'}</h3>
                  </div>
                )
                : (
                  <ul> {
                    queue.map(player => (
                      <li key={player.user._id} className="user-list-item flex space-between align-center">
                        <div><h5>{player.user.screenname}</h5></div>
                      </li>
                    ))}
                  </ul>
                )
              }

              {
                showModal
                && (
                  <div className={`modal flex justify-center align-center ${isErrorModal ? 'modal-error' : ''}`}>
                    <div className="modal-container">
                      <h2>Are you sure?</h2>
                      <div>
                        <button className="button-white" onClick={this.confirmUser}>YES</button>
                        <button className="button-white" onClick={this.closeModal}>NO</button>
                      </div>
                    </div>
                  </div>
                )
              }
            </div>
          )
        }
      </div>
    );
  }
}

export default Bay;
