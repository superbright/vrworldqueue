import React, { Component } from 'react';
import io from 'socket.io-client';
import SocketConnectionStatus from './SocketConnectionStatus';
import showRemaining from '../utils/showRemaining';

const backgroundConfig = 'no-repeat center center fixed'
const backgroundGif = 'https://media4.giphy.com/media/3o85gd3noLuSkE4Lkc/giphy.gif';

const numToString = (num) => {
  const result = num.toString();
  if (result && !isNaN(result)) {
    return result.length === 1 ? `0${result}` : result;
  }
  return '--';
};

class BayPlay extends Component {
  constructor() {
    super();
    this.state = {
      bay: null,
      socket: null,
      play: { state: 'idle' }, // idle, ready, gameplay, onboarding
      connected: false,
      minsLeft: '--',
      secondsLeft: '--',
      interval: null,
    };

    this.connectSocket = this.connectSocket.bind(this);
    this.onPlayButtonPressed = this.onPlayButtonPressed.bind(this);
    this.onCancelButtonPressed = this.onCancelButtonPressed.bind(this);
    this.countDown = this.countDown.bind(this);
  }

  componentWillMount() {
    const { match: { params: { bayid } } } = this.props;

    fetch(`/api/bays/${bayid}`, {
      method: 'get',
    }).then(res => res.json()).then((bay) => {
      this.setState({
        bay,
        play: bay.currentState,
      });
    }).catch((err) => {
      console.log('error', err);
    });

    this.setState({
      socket: io(window.location.origin, {
        query: `clientType=button&clientId=${bayid}`,
      }),
    }, () => {
      this.connectSocket();
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
      socket.on('setState', (res) => {
        console.log('setstate', res);
        this.setState({ play: res });

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

  onPlayButtonPressed() {
    const { match: { params: { bayid } } } = this.props;

    this.state.socket.emit('startButton', { clientId: bayid });
  }

  onCancelButtonPressed() {
    const { match: { params: { bayid } } } = this.props;

    this.state.socket.emit('endButton', { clientId: bayid });
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

  render() {
    const { play, connected, minsLeft, secondsLeft, bay, background } = this.state;

    let playDom;

    switch (play.state) {
      case 'onboarding':
        // last person is done playing but next person hasn't swiped in yet
        playDom = (
          <div className="big-font"><h3>Waiting for next player to swipe in</h3></div>
        );
        break;
      case 'ready':
        // next player has swiped in, display the play button
        playDom = (
          <div className="play-button">
            <svg viewBox="0 0 200 200" alt="Play video" onClick={this.onPlayButtonPressed}>
              <circle cx="100" cy="100" r="90" fill="none" strokeWidth="15" stroke="#fff" />
              <polygon
                points="70, 55 70, 145 145, 100"
                fill="#fff"
              />
            </svg>
          </div>
        );
        break;
      case 'idle':
        // no players in line
      case 'gameplay':
        // person is playing
      default:
        playDom = (
          <div>
            <h1>VRWORLD</h1>
            {
              play.state !== 'idle'
              &&
              <div>
                <h2>{numToString(minsLeft)}:{numToString(secondsLeft)}</h2>
                <button onClick={this.onCancelButtonPressed}>end game</button>
              </div>
            }
          </div>
        );
        break;
    }
    console.log(this.state);

    const backgroundURL = (play.state !== 'ready' || !bay)
      ? backgroundGif
      : bay.instructionFile;

    return (
      <div
        className={`bay-play flex justify-center ${play.state !== 'ready' ? 'align-center' : '' }`}
        style={{
          background: `url(${backgroundURL}) ${backgroundConfig}`,
          backgroundSize: 'cover',
        }}
      >
        {
          bay &&
          <header className="bay-header flex space-between align-center">
            <h5>{bay.name}</h5>
            <h5>{bay.game}</h5>
          </header>
        }

        {playDom}
        <SocketConnectionStatus connected={connected} />
      </div>
    );
  }
}

export default BayPlay;
