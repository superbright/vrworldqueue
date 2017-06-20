import React from 'react';

const refresh = () => { location.reload(); };

const SocketConnectionStatus = ({ connected }) => (
  <div
    className={`socket-connection ${connected ? 'connected': 'disconnected'}`}
    onClick={refresh}
  ></div>
);

export default SocketConnectionStatus;
