import React, { Component } from 'react';
import io from 'socket.io-client';
import SocketConnectionStatus from './SocketConnectionStatus';
import showRemaining from '../utils/showRemaining';

const numToString = (num) => {
  const result = num.toString();
  if (result && !isNaN(result)) {
    return result.length === 1 ? `0${result}` : result;
  }
  return '--';
};

class Bay extends Component {
  constructor() {
    super();
    this.state = {
      bay: null,
      socket: null,
      queue: [],
      showModal: false,
      error: null,
      success: null,
      userAttempt: null,
      play: { state: 'idle' },
      connected: false,
      minsLeft: '--',
      secondsLeft: '--',
      interval: null,
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
        play: bay.currentState,
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
      this.setState({ queue });
    }).catch((err) => {
      console.log('error', err);
    });
  }

  connectSocket() {
    const { socket } = this.state;
    if (socket) {
      socket.on('connect', () => {
        this.setState({ connected: true });
      });
      socket.on('disconnect', () => {
        this.setState({ connected: false });
      });
      socket.on('queue', (res) => {
        this.setState({ queue: res });
      });
      socket.on('userattempt', (res) => {
        if (res.error) {
          setTimeout(this.closeModal, 3000);
          return this.setState({ showModal: true, error: res.error });
        }
        return this.setState({ error: null, userAttempt: res, showModal: true });
      });
      socket.on('setState', (res) => {
        console.log('setstate socket', res);
        this.setState({ play: res});

        if (res.state === 'ready') {
          // show a temporary modal that tells them to go to the play button
          this.setState({ showModal: true, success: `You're up ${res.user.screenname}, Go to the next screen!`});
          setTimeout(() => {
            this.setState({ showModal: false, success: null });
          }, 5000);
        }

        if (this.state.play.endTime) {
          const interval = setInterval(() => {
            this.countDown();
          }, 1000);
          this.countDown();
          this.setState({ interval });
        }
      });
    }
  }

  countDown() {
    const { endTime } = this.state.play;
    const minSecs = showRemaining(new Date(endTime));

    if (isNaN(minSecs[0])) {
      clearInterval(this.state.interval);
      this.setState({ interval: null });
    }
    this.setState({
      minsLeft: minSecs[0],
      secondsLeft: minSecs[1],
    });
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
      if (res[0] && res[0].timeAdded) {
        console.log('userAttempt-', res[0].timeAdded);
        console.log('userAttempt-', showRemaining(new Date(res[0].timeAdded)));
        // this.countDown({ end });
      }
      this.setState({ queue: res });
      this.closeModal();
    }).catch((err) => {
      console.log('error', err);
    });
  }

  render() {
    const {
      bay,
      play,
      queue,
      showModal,
      error,
      success,
      connected,
      minsLeft,
      secondsLeft,
    } = this.state;

    const { match: { params: { bayid } } } = this.props;
    const [onDeck, ...restOfQueue] = queue;

    return (
      <div key={bayid}>
        {
          bay && (
            <div>
              <header className="flex space-between align-center">
                <h5>{bay.name}</h5>
                <h5>{bay.game}</h5>
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
                    <div className={`bay-on-deck ${bay.play.state === 'onboarding' ? 'waiting' : ''}`}>
                      <div className="simple-container">
                        <p>{bay.play.state === 'onboarding' ? 'Waiting for you to swipe in' : 'Up next'}</p>
                        <div className="flex space-between align-center">
                          <h1>{onDeck.user.screenname}</h1>
                          <h1>{numToString(minsLeft)}:{numToString(secondsLeft)}</h1>
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
                  <div className={`modal flex justify-center align-center ${error ? 'modal-error' : ''} ${success ? 'modal-success' : ''}`}>
                    <div className="modal-container">
                      {
                        error
                        &&
                        <div>
                          <h2>{error}</h2>
                          <button className="button-white" onClick={this.closeModal}>CLOSE</button>
                        </div>
                      }

                      {
                        success
                        &&
                        <div>
                          <h2>{success}</h2>
                          <button className="button-white" onClick={this.closeModal}>CLOSE</button>
                        </div>
                      }

                      {
                        (!error && !success)
                        &&
                        <div>
                          <h2>Are you sure?</h2>
                          <div>
                            <button className="button-white" onClick={this.confirmUser}>YES</button>
                            <button className="button-white" onClick={this.closeModal}>NO</button>
                          </div>
                        </div>
                      }

                    </div>
                  </div>
                )
              }
            </div>
          )
        }
        <SocketConnectionStatus connected={connected} />
      </div>
    );
  }
}

export default Bay;
