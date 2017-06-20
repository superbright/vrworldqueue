import React, { Component } from 'react';
import io from 'socket.io-client';
import SocketConnectionStatus from './SocketConnectionStatus';

class SocketController extends Component {
  constructor() {
    super();

    this.state = {
      socket: null,
      connected: false,
      fetching: false,
    };

    this.connectSocket = this.connectSocket.bind(this);
    this.refreshPages = this.refreshPages.bind(this);
  }

  componentWillMount() {
    this.setState({
      socket: io(window.location.origin, {
        query: `clientType=global&clientId=1`,
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
    }
  }

  refreshPages() {
    this.setState({ fetching: true });
    this.state.socket.emit('refresh');
    // setTimeout(() => {}, 1000);
  }

  render() {
    const { connected } = this.state;

    return (<div>
      <header className="flex space-between align-center">
        <h5>Socket Controller</h5>
      </header>

      <div className="simple-container">
        <button onClick={this.refreshPages}>Refresh Pages</button>
      </div>

      <SocketConnectionStatus connected={connected} />
    </div>);
  }
}


export default SocketController;
