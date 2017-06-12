import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import AdminList from './AdminList';
import AdminUser from './AdminUser';

const NoId = () => <div>No Admin ID in route, try: /admin/*ADMIN_ID*</div>;

class Admin extends Component {
  constructor() {
    super();

    this.state = {
      users: [],
    };
  }

  componentWillMount() {
    return fetch('/api/users', {
      method: 'get',
    }).then(res => res.json()).then((users) => {
      this.setState({ users });
    }).catch((err) => {
      console.log('error', err);
    });
  }

  render() {
    const { users } = this.state;
    const { match } = this.props;

    return (
      <div>
        <header className="flex space-between align-center">
          <h5>vrworld admin</h5>
        </header>

        <Route
          exact
          path={`${match.url}/:adminid/user/:userid`}
          component={props => <AdminUser {...props} users={users} />}
        />
        <Route
          exact
          path={`${match.url}/:adminid`}
          component={props => <AdminList {...props} users={users} />}
        />
        <Route exact path={match.url} component={NoId} />
      </div>
    );
  }
}

export default Admin;
