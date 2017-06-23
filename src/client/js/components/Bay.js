import React, { Component } from 'react';
import io from 'socket.io-client';
import Spinner from 'react-spin';
import VRWorldStamp from '../../images/VRWorld_Stamp.png';
import SocketConnectionStatus from './SocketConnectionStatus';
import showRemaining from '../utils/showRemaining';
import config from '../utils/spinnerConfig';
import { timerparams } from '../../../shared/timerconfig';

const numToString = (num) => {
  const result = num.toString();
  if (result && result > 0 && !isNaN(result)) {
    return result.length === 1 ? `0${result}` : result;
  }
  return '00';
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
      fetching: false,
    };

    this.connectSocket = this.connectSocket.bind(this);
    this.fetchQueue = this.fetchQueue.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.confirmUser = this.confirmUser.bind(this);
    this.countDown = this.countDown.bind(this);
  }

  componentWillMount() {
    const { match: { params: { bayid } }, isBigBay } = this.props;
    if (isBigBay) {
      console.log('here');
      document.body.className += ' ' + 'big-bay-body';
    }
    return fetch(`/api/bays/${isBigBay ? 'local/' : ''}${bayid}`, {
      method: 'get',
    }).then(res => res.json()).then((bay) => {
      this.setState({
        bay,
        play: bay.currentState,
        socket: io(window.location.origin, {
          query: `clientType=${isBigBay ? 'bigqueue' : 'queue'}&clientId=${bayid}`,
            'forceNew': true
        }),
      });

      if (bay.currentState.endTime) {
        const interval = setInterval(() => {
          this.countDown();
        }, 1000);
        this.countDown();
        this.setState({ interval });
      }

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
          console.log(res);
        this.setState({ queue: res });
      });
      socket.on('userattempt', (res) => {
        if (res.error) {
          setTimeout(this.closeModal, timerparams.modalTimeout);
          return this.setState({ showModal: true, error: res.error });
        }
        return this.setState({ error: null, userAttempt: res, showModal: true });
      });
      socket.on('refresh', () => {
        location.reload();
      });
      socket.on('setState', (res) => {
          console.log('got set state ');
          console.log(res);
        this.setState({ play: res });
        if (res.state === 'ready') {
          // show a temporary modal that tells them to go to the play button
                this.setState({ showModal: true, success: `You're up ${res.user.screenname}!  Go to the next screen!` });
                 setTimeout(this.closeModal, timerparams.modalTimeout);


        }
          else if(res.state === 'error')
         {
                  this.setState({showModal: true, error: res.error});
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
    this.setState({
      showModal: false,
      userAttempt: showModal ? null : userAttempt,
      error: null,
      success: null,
    });
  }

  confirmUser() {
    const { userAttempt: { data: { user } } } = this.state;
    const { match: { params: { bayid } } } = this.props;

    this.setState({ fetching: true });

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
      this.setState({ queue: res, fetching: false });
      this.closeModal();
    }).catch((err) => {
      this.setState({ queue: res, fetching: false });
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
      fetching,
      userAttempt,
    } = this.state;
    const { isBigBay } = this.props;

    const { match: { params: { bayid } } } = this.props;
    const [onDeck, ...restOfQueue] = queue;

    return (
      <div key={bayid} className={`bay-page ${isBigBay ? 'big-bay' : ''}`}>
        {
          bay && (
            <div>
              <header className="flex space-between align-center">
                {
                  isBigBay
                  ? (
                    <div className="flex align-center">
                      <img className="big-bay-logo" src={VRWorldStamp} />
                      <h5>#vrworld</h5>
                    </div>
                  ) :
                  <h5>{bay.name}</h5>
                }
                <h5>{bay.game}</h5>
              </header>
              {
                queue.length === 0
                ? (
                  <div className="simple-container user-search">
                    {
                      isBigBay
                      ? (
                        <div className="big-bay-main-logo">
                          <img className="big-bay-logo-bigger" src={VRWorldStamp} />
                          <h1>#vrworld</h1>
                        </div>
                      )
                      : (
                        <h3>{'There\'s no one in line, register now!'}</h3>
                      )
                    }
                  </div>
                )
                : (
                  <div>
                    <div className={`bay-on-deck ${(play && play.state  === 'onboarding') ? 'waiting' : ''}`}>
                      <div className="simple-container">
                        <h5>{(play && play.state  === 'onboarding') ? 'Waiting for you to swipe in' : 'Up next'}</h5>
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
                  <div
                    className={
                      `modal flex justify-center align-center ${error ? 'modal-error' : ''} ${success ? 'modal-success' : ''} ${(userAttempt && userAttempt.warning) ? 'modal-warning' : '' }`
                    }
                  >
                    <div className="modal-container">
                      {
                        error
                        &&
                        <div>
                          <h2>{error}</h2>

                        </div>
                      }

                      {
                        success
                        &&
                        <div>
                          <h2>{success}</h2>

                        </div>
                      }

                      {
                        (!error && !success)
                        &&
                        <div>
                          <h2>{(userAttempt && userAttempt.info) ? userAttempt.info : userAttempt.warning}</h2>
                          {
                            fetching
                            ? <Spinner config={{ ...config, color: '#ffffff'}} />
                            : (
                              <div>
                                <button className="button-white" onClick={this.confirmUser}>YES</button>
                                <button className="button-white" onClick={this.closeModal}>NO</button>
                              </div>
                            )
                          }
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
