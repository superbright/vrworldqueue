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
      error: null,
      userAttempt: null,
      play: null,
    };

    this.connectSocket = this.connectSocket.bind(this);
    this.fetchQueue = this.fetchQueue.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.confirmUser = this.confirmUser.bind(this);
    this.countDown = this.countDown.bind(this);
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
        console.log('HELLO');
        this.setState({ queue: res });
      });
      socket.on('userattempt', (res) => {
        
        console.log('userAttempt', res);
        if (res.error) {
          console.log('res error', res.error);
          setTimeout(this.closeModal, 3000);
          return this.setState({ showModal: true, error: res.error });
        }
        return this.setState({ error:null, userAttempt: res, showModal: true });
      });
      socket.on('setState', (res) => {
        console.log('setstate socket', res);
        this.setState({ play: res});
        

        if (this.state.play.endTime) {
          this.countDown();
        }
      });
    }
  }

  countDown() {
    const { endTime } = this.state.play;
  }

  closeModal() {
    const { showModal, userAttempt } = this.state;
    this.setState({ showModal: false, userAttempt: showModal ? null : userAttempt });
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
      console.log('user confirmed', res);
      this.setState({ queue: res });
      this.closeModal();
    }).catch((err) => {
      console.log('error', err);
    });
  }

  render() {
    const { bay, queue, showModal, error } = this.state;
    const { match: { params: { bayid } } } = this.props;
    const [onDeck, ...restOfQueue] = queue;

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
                  <div>
                    <div className="bay-on-deck">
                      <div className="simple-container">
                        <p>On Deck</p>
                        <div className="flex space-between align-center">
                          <h1>{onDeck.user.screenname}</h1>
                          <h1>00:00</h1>
                        </div>
                      </div>
                    </div>
                    <ul> {
                      restOfQueue.map(player => (
                        <li
                          key={player.user._id}
                          className="user-list-item flex space-between align-center"
                        >
                          <h5>{player.user.screenname}</h5>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              }

              {
                showModal
                && (
                  <div className={`modal flex justify-center align-center ${error ? 'modal-error' : ''}`}>
                    <div className="modal-container">
                      {
                        error
                        ? (<div>
                          <h2>{error}</h2>
                          <button className="button-white" onClick={this.closeModal}>CLOSE</button>
                        </div>)
                        : (<div>
                          <h2>Are you sure?</h2>
                          <div>
                            <button className="button-white" onClick={this.confirmUser}>YES</button>
                            <button className="button-white" onClick={this.closeModal}>NO</button>
                          </div>
                        </div>)
                      }

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
