import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import update from 'immutability-helper';
import AdminList from './AdminList';
import AdminUser from './AdminUser';
import io from 'socket.io-client';

const NoId = () => <div>No Admin ID in route, try: /admin/*ADMIN_ID*</div>;

class Admin extends Component {
  constructor() {
    super();

    this.state = {
      users: [],
      socket: null,
      tempRFID: '',
    };
    this.updateUser = this.updateUser.bind(this);
    this.connectSocket = this.connectSocket.bind(this);
    this.clearTempRFID = this.clearTempRFID.bind(this);
  }

  componentWillMount() {
    const { match: { params: { adminid } } } = this.props;
    return fetch('/api/users', {
      method: 'get',
    }).then(res => res.json()).then((users) => {
      this.setState({
        users,
        socket: io('http://localhost:3000', {query: `clientType=admin&clientId=${adminid}` }),
      });

      this.connectSocket();
    }).catch((err) => {
      console.log('error', err);
    });
  }

  updateUser(userIdx, key, value) {
    this.setState({
      users: update(this.state.users, {[userIdx]: {[key]: {$set: value}}})
    })
  }

  connectSocket() {
    const { socket } = this.state;

    socket.on('rfid', (rfid) => {
      console.log('RFID message', rfid);
      this.setState({ tempRFID: rfid });
    });
  }

  clearTempRFID() {
    this.setState({ tempRFID: '' });
  }

  render() {
    const { users, tempRFID } = this.state;
    const { match } = this.props;

    return (
      <div>
        <header className="flex space-between align-center">
          <h5>vrworld admin</h5>
        </header>

        <Route
          exact
          path={`${match.url}/:adminid/user/:userid`}
          component={props => <AdminUser {...props} updateUser={this.updateUser} tempRFID={tempRFID} clearTempRFID={this.clearTempRFID} />}
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
