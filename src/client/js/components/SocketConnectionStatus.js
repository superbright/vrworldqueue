import React from 'react';

const SocketConnectionStatus = ({ connected }) => (
  <div className={`socket-connection ${connected ? 'connected': 'disconnected'}`}>

  </div>
);

export default SocketConnectionStatus;
