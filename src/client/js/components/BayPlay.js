import React, { Component } from 'react';
import io from 'socket.io-client';

class BayPlay extends Component {
  constructor() {
    super();
    this.state = {
      socket: null,
      play: 'idle', // idle, ready, gameplay, onboarding
    };

    this.connectSocket = this.connectSocket.bind(this);
    this.onPlayButtonPressed = this.onPlayButtonPressed.bind(this);
  }

  componentWillMount() {
    const { match: { params: { bayid } } } = this.props;

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
      socket.on('setState', (res) => {
        console.log('setstate', res);
        this.setState({ play: res });
      });
    }
  }

  onPlayButtonPressed(){
    const { match: { params: { bayid } } } = this.props;

    this.state.socket.emit('startButton', { 'clientId': bayid });
  }

  render() {
    const { play } = this.state;

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
            <svg viewBox="0 0 200 200" alt="Play video">
              <circle cx="100" cy="100" r="90" fill="none" strokeWidth="15" stroke="#fff" />
              <polygon
                points="70, 55 70, 145 145, 100"
                fill="#fff"
                onClick={this.onPlayButtonPressed}
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
          </div>
        );
        break;
    }


    return (
      <div className="bay-play flex justify-center align-center">
        {playDom}
      </div>
    );
  }
}

export default BayPlay;
