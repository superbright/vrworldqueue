import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import Bay from './Bay';
import BayList from './BayList';
import BayPlay from './BayPlay';
import AdminQueue from './AdminQueue';

class Bays extends Component {
  render() {
    const { match } = this.props;

    return (
      <div>
        <header className="flex space-between align-center">
          <h5>VRWORLD BAYS</h5>
        </header>

        <Route
          exact
          path={`${match.url}/:bayid`}
          component={props => <Bay {...props} />}
        />
        <Route
          exact
          path={`${match.url}/:bayid/bigbay`}
          component={props => <Bay {...props} isBigBay />}
        />
        <Route
          exact
          path={`${match.url}/:bayid/play`}
          component={BayPlay}
        />
        <Route
          exact
          path={`${match.url}/:bayid/queue`}
          component={AdminQueue}
        />
        <Route
          exact
          path={`${match.url}`}
          component={BayList}
        />
      </div>
    )
  }
}

export default Bays;
