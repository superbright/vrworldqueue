import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import set from 'lodash/set';
import moment from 'moment';
import validate from 'validate.js';
import UserForm from './UserForm';
import SocketConnectionStatus from './SocketConnectionStatus';
import formConstraints from '../utils/formConstraints';

class AdminUser extends Component {
  constructor() {
    super();

    this.state = {
      user: null,
      socket: null,
      tempRFID: '',
      errors: null,
      connected: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.connectSocket = this.connectSocket.bind(this);
    this.clearTempRFID = this.clearTempRFID.bind(this);
    this.activateUser = this.activateUser.bind(this);
  }

  componentWillMount() {
    const { match: { params: { userid, adminid } } } = this.props;
    return fetch(`/api/users/${userid}`, {
      method: 'get',
    }).then(res => res.json()).then((user) => {
      this.setState({
        user,
        socket: io(window.location.origin, { query: `clientType=admin&clientId=${adminid}` }),
      }, () => {
        this.connectSocket();
      });
    }).catch((err) => {
      console.log('error', err);
    });
  }

  connectSocket() {
    const { socket } = this.state;
    if (socket) {
      socket.on('connect', () => {
        this.setState({ connected: true });
      });
      socket.on('disconnect', () => {
        this.setState({ connected: false });
      });
      socket.on('rfid', (res) => {
        console.log('rfid', res);
        this.setState({ tempRFID: res });
      });
      socket.on('refresh', () => {
        location.reload();
      });
    }
  }

  clearTempRFID() {
    this.setState({ tempRFID: '' });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { user, tempRFID } = this.state;

    const errors = validate(user, formConstraints);

    if (errors) {
      this.setState({ errors });
    } else {
      this.setState({ errors: null });

      if (tempRFID) {
        user.rfid.id = tempRFID;
      }

      fetch('/api/users', {
        method: 'post',
        body: JSON.stringify(user),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      }).then(res => res.json()).then((res) => {
        this.setState({
          user: res,
        });
        this.clearTempRFID();
      }).catch((err) => {
        console.log('error', err);
      });
    }
  }

  handleChange(event) {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      user: set(this.state.user, name, value)
    });
  }

  activateUser(shouldActivate = true) {
    const { match: { params: { userid, adminid } } } = this.props;
    fetch(`/api/users/${userid}/${shouldActivate ? 'activate' : 'deactivate'}`, {
      method: 'post',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    }).then(res => res.json()).then((res) => {
      console.log('user activated', res);
      this.setState({
        user: res,
      });
      this.clearTempRFID();
    }).catch((err) => {
      console.log('error', err);
    });
  }

  render() {
    const { user, tempRFID, errors, connected } = this.state;
    const { match: { params: { userid, adminid } } } = this.props;

    return (
      <div className="admin-user-page simple-container" key={userid}>
        <header className="flex space-between align-center">
          <h5>vrworld admin {adminid}</h5>
        </header>

        <Link to={`/admin/${adminid}`}>{'< Return to Users List'}</Link>

        {
          user && (
            <div className="admin-user-page-info">
              <h2>{user.firstname} {user.lastname}</h2>
              { tempRFID &&
                <div className="detected-rfid"><h5>Detected RFID: {tempRFID}</h5></div>
              }
              <div>
                <span className="big-font">RFID</span>: {user.rfid.id || 'no rfid set yet' }
              </div>

              {
                user.rfid.id && (
                  <div>
                    <div>
                      <div>Currently Active: {user.rfid.activated ? 'YES' : 'NO'}</div>
                      <div>Valid Until: {moment(user.rfid.expiresAt).format('dddd, h:mm:ss a')}</div>
                    </div>
                  </div>
                )
              }

              <UserForm
                form={user}
                submitText={'save user'}
                handleChange={this.handleChange}
                handleSubmit={this.handleSubmit}
                errors={errors}
                twoButtons
                admin
              />
            </div>
          )
        }

        <SocketConnectionStatus connected={connected} />
      </div>
    );
  }
}

export default AdminUser;
