import React from 'react';
import { render } from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Link,
} from 'react-router-dom';

import '../css/normalize_skeleton.css';
import '../css/main.css';

import SignupForm from './components/SignupForm';
import Waiver from './components/Waiver';
import Thanks from './components/Thanks';

const AppRouter = () => (
  <Router>
    <div>
      <Route exact path="/signup/" component={SignupForm} />
      <Route exact path="/signup/waiver" component={Waiver} />
      <Route exact path="/signup/thanks" component={Thanks} />
    </div>
  </Router>
);

render(<AppRouter />, document.getElementById('root'));
