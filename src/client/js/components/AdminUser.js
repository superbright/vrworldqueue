import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import UserForm from './UserForm';

class AdminList extends Component {
  constructor() {
    super();

    this.state = {
      user: null,
      socket: null,
      tempRFID: '',
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
      });
      this.connectSocket();
    }).catch((err) => {
      console.log('error', err);
    });
  }

  connectSocket() {
    const { socket } = this.state;
    if (socket) {
      socket.on('rfid', (res) => {
        this.setState({ tempRFID: res });
      });
    }
  }

  clearTempRFID() {
    this.setState({ tempRFID: '' });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { user, tempRFID } = this.state;
    let data;
    if (tempRFID) {
      data = { ...user, rfid: tempRFID };
    } else {
      const { rfid, ...restOfUser } = user;
      data = restOfUser;
    }

    fetch('/api/users', {
      method: 'post',
      body: JSON.stringify(data),
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

  handleChange(event) {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      user: {
        ...this.state.user,
        [name]: value,
      },
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
    const { user, tempRFID } = this.state;
    const { match: { params: { userid, adminid } } } = this.props;
    const activated = user
      ? (new Date(user.rfid.expiresAt).getTime() - new Date().getTime()) > 0
      : false;

    return (
      <div className="admin-user-page simple-container" key={userid}>
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
                    {
                      activated
                      ? <div>{'User\'s account activated!'} <button onClick={() => this.activateUser(false)}>Deactivate Account</button></div>
                      : <button onClick={this.activateUser}>Activate Account</button>
                    }
                  </div>
                )
              }

              <UserForm form={user} submitText={'update'} handleChange={this.handleChange} handleSubmit={this.handleSubmit} />
            </div>
          )
        }
      </div>
    );
  }
}

export default AdminList;
