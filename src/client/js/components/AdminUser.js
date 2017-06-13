import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import UserForm from './UserForm';
import io from 'socket.io-client';

class AdminList extends Component {
  constructor() {
    super();

    this.state = {
      user: null,
      socket: null,
      tempRFID: '',
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.connectSocket = this.connectSocket.bind(this);
    this.clearTempRFID = this.clearTempRFID.bind(this);
  }

  componentWillMount() {
    const { match: { params: { userid, adminid } } } = this.props;
    return fetch(`/api/users/${userid}`, {
      method: 'get',
    }).then(res => res.json()).then((user) => {
      this.setState({
        user,
        socket: io('http://localhost:3000', {query: `clientType=admin&clientId=${adminid}` }),
      });
      this.connectSocket();
    }).catch((err) => {
      console.log('error', err);
    });
  }

  connectSocket() {
    const { socket } = this.state;

    socket.on('rfid', (res) => {
      console.log('RFID message', res);
      this.setState({ tempRFID: res.tag });
    });
  }

  clearTempRFID() {
    this.setState({ tempRFID: '' });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { email, phone, screenname, tempRFID } = this.state.user;

    fetch('/api/users', {
      method: 'post',
      body: JSON.stringify({ email, phone, screenname, rfid: tempRFID }),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    }).then(res => res.json()).then((res) => {
      console.log('success', res);
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
      }
    });
  }

  render() {
    const { user, tempRFID } = this.state;
    const { match: { params: { userid, adminid } } } = this.props;

    return (
      <div className="admin-user-page simple-container" key={userid}>
        <Link to={`/admin/${adminid}`}>{`< Return to Users List`}</Link>

        {
          user && (
            <div className="admin-user-page-info">
              <h2>{user.name}</h2>
              <div><span className="big-font">RFID</span>: { tempRFID || 'no RFID scanned' }</div>
              {user.rfid.id ? user.rfid.id.type :'no rfid set yet' }

              <UserForm form={user} submitText={'update'} handleChange={this.handleChange} handleSubmit={this.handleSubmit} />
            </div>
          )
        }
      </div>
    );
  }
}

export default AdminList;
