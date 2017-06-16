import React, { Component } from 'react';
import io from 'socket.io-client';

class BayPlay extends Component {
  constructor() {
    super();
    this.state = {
      socket: null,
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
    });
      /*hack since client wasn't connecting*/
      setTimeout(()=>{
            this.connectSocket();
  
      }, 1000);
  }

  connectSocket() {
    const { socket } = this.state;
    if (socket) {
        console.log("Socket connected");
      socket.on('setState', (res) => {
        console.log('setstate socket', res);
        
        // this.setState({ userAttempt: res, showModal: true });
      });
    }
  }

  onPlayButtonPressed(){
    const { match: { params: { bayid } } } = this.props;
    console.log('startButton Pressed');
    this.state.socket.emit('startButton', { 'clientId': bayid });
  }

  render() {
    return (
      <div className="bay-play flex justify-center align-center">
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
      </div>
    );
  }
}

export default BayPlay;
