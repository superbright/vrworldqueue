import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import '../css/normalize_skeleton.css';
import '../css/main.css';

import Signup from './components/Signup';
import Waiver from './components/Waiver';
import Thanks from './components/Thanks';

import Admin from './components/Admin';
import Bays from './components/Bays';
import SocketController from './components/SocketController';

const AppRouter = () => (
  <Router>
    <div>
      <Route path="/signup/" component={Signup} />
      <Route path="/signup/waiver" component={Waiver} />
      <Route path="/signup/thanks" component={Thanks} />
      <Route path="/admin" component={Admin} />
      <Route path="/bay" component={Bays} />
      <Route path="/sockets" component={SocketController} />
    </div>
  </Router>
);

render(<AppRouter />, document.getElementById('root'));
