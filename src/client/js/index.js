import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import '../css/normalize_skeleton.css';
import '../css/main.css';

import SignupForm from './components/SignupForm';
import Waiver from './components/Waiver';
import Thanks from './components/Thanks';

import Admin from './components/Admin';
import Bay from './components/Bay';

const AppRouter = () => (
  <Router>
    <div>
      <Route path="/signup/" component={SignupForm} />
      <Route path="/signup/waiver" component={Waiver} />
      <Route path="/signup/thanks" component={Thanks} />
      <Route path="/admin" component={Admin} />
      <Route path="/bay" component={Bay} />
    </div>
  </Router>
);

render(<AppRouter />, document.getElementById('root'));
