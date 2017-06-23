import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import update from 'immutability-helper';
import AdminList from './AdminList';
import AdminUser from './AdminUser';
import AdminQueue from './AdminQueue';

const adminList = [
  {
    name: '',
    id: 1,
  },
  {
    name: '',
    id: 2,
  }
];

const NoId = () => <ul>
  {
    adminList.map((a) => (
      <li key={`admin-${a.id}`} className="user-list-item flex space-between align-center">
        <Link to={`/admin/${a.id}`}>Admin Location: {a.id}</Link>
      </li>
    ))
  }
</ul>;

class Admin extends Component {
  constructor() {
    super();

    this.state = {
      users: [],
      socket: null,
      tempRFID: '',
    };

    this.updateUser = this.updateUser.bind(this);
    this.getUsers = this.getUsers.bind(this);
  }

  componentWillMount() {
    this.getUsers();
    document.title = 'Admin';
  }

  getUsers() {
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
    const { users, tempRFID } = this.state;
    const { match } = this.props;
    const { adminid } = match.params;

    return (
      <div>
        <header className="flex space-between align-center">
          <h5>vrworld admin {adminid}</h5>
        </header>

        <Route
          exact
          path={`${match.url}/queue/:bayid`}
          component={props => <AdminQueue {...props} />}
        />
        <Route
          exact
          path={`${match.url}/:adminid/user/:userid`}
          component={props => <AdminUser {...props} updateUser={this.updateUser} />}
        />
        <Route
          exact
          path={`${match.url}/:adminid`}
          component={props => <AdminList {...props} users={users} getUsers={this.getUsers} />}
        />
        <Route exact path={match.url} component={NoId} />
      </div>
    );
  }
}

export default Admin;
