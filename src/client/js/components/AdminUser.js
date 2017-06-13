import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import UserForm from './UserForm';

class AdminList extends Component {
  constructor() {
    super();

    this.state = {
      user: null,
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    const { match: { params: { userid } } } = this.props;
    return fetch(`/api/users/${userid}`, {
      method: 'get',
    }).then(res => res.json()).then((user) => {
      this.setState({ user });
    }).catch((err) => {
      console.log('error', err);
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { email, phone, screenname } = this.state.user;

    fetch('/api/users', {
      method: 'post',
      body: JSON.stringify({ email, phone, screenname}),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    }).then(res => res.json()).then((res) => {
      console.log('success', res);
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
    const { user } = this.state;
    const { tempRFID, match: { params: { userid, adminid } } } = this.props;

    return (
      <div className="admin-user-page simple-container" key={userid}>
        <Link to={`/admin/${adminid}`}>{`< Return to Users List`}</Link>

        {
          user && (
            <div className="admin-user-page-info">
              <h2>{user.name}</h2>
              <div><span className="big-font">RFID</span>: { tempRFID || 'no RFID scanned' }</div>
              <UserForm form={user} submitText={'update'} handleChange={this.handleChange} handleSubmit={this.handleSubmit} />
            </div>
          )
        }
      </div>
    );
  }
}

export default AdminList;
