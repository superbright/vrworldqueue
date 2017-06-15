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
      userAttempt: null,
    };

    this.connectSocket = this.connectSocket.bind(this);
    this.fetchQueue = this.fetchQueue.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.confirmUser = this.confirmUser.bind(this);
  }

  componentWillMount() {
    const { match: { params: { bayid } } } = this.props;

    return fetch(`/api/bays/${bayid}`, {
      method: 'get',
    }).then(res => res.json()).then((bay) => {
      this.setState({
        bay,
        socket: io('http://localhost:3000', {
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
        // this.setState({ queue: res });
      });
    }
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal })
  }

  confirmUser() {
    const { match: { params: { bayid } } } = this.props;

    fetch(`/api/bay/${bayid}/enqueue`, {
      method: 'post',
      // body: JSON.stringify({ userId:  }), TODO
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    }).then(res => res.json()).then((res) => {
      console.log('user added, queue updated', res);
    }).catch((err) => {
      console.log('error', err);
    });
  }

  render() {
    const { bay, queue } = this.state;
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
                      <li className="user-list-item flex space-between align-center">
                        <div>{player.user.screenname}</div>
                      </li>
                    ))}
                  </ul>
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
