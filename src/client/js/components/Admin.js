import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import update from 'immutability-helper';
import AdminList from './AdminList';
import AdminUser from './AdminUser';
import io from 'socket.io-client';

const NoId = () => <div>No Admin ID in route, try: /admin/*ADMIN_ID*</div>;

console.log('hello');
// const socket = io('http://localhost:3000/', {query: { clientType: 'admin', clientId: 2 }});
const socket = io('http://localhost:3000', {query: 'clientType=admin&clientId=2' });

class Admin extends Component {
  constructor() {
    super();

    this.state = {
      users: [],
      socket: null,
    };
    this.updateUser = this.updateUser.bind(this);
  }

  componentWillMount() {
    const { match: { params: { adminid } } } = this.props;
    return fetch('/api/users', {
      method: 'get',
    }).then(res => res.json()).then((users) => {

      this.setState({ users });
    }).catch((err) => {
      console.log('error', err);
    });
  }

  updateUser(userIdx, key, value) {
    this.setState({
      users: update(this.state.users, {[userIdx]: {[key]: {$set: value}}})
    })
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
          component={props => <AdminUser {...props} updateUser={this.updateUser} />}
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
