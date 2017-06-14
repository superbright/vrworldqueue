import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class AdminList extends Component {
  constructor() {
    super();

    this.state = {
      searchValue: '',
    };

    this.updateSearch = this.updateSearch.bind(this);
    this.filterUsers = this.filterUsers.bind(this);
  }

  updateSearch(event) {
    const { target: { value } } = event;

    this.setState({ searchValue: value });
  }

  filterUsers() {
    const { searchValue } = this.state;
    const { users } = this.props;

    return searchValue
      ? users.filter(u => (
        u.name.indexOf(searchValue) >= 0
        || (
          u.email &&
          u.email.indexOf(searchValue) >= 0
        )
      ))
      : users;
  }

  render() {
    const { searchValue } = this.state;
    const { match: { params: { adminid } } } = this.props;

    const filteredUsers = this.filterUsers();

    return (
      <div>
        <div className="user-search simple-container">
          <input type="text" placeholder="Search Users" onChange={this.updateSearch} value={searchValue} />
        </div>

        <ul>
          {
            filteredUsers.map(user => (
              <li
                className="user-list-item flex space-between align-center"
                key={user._id}
              >
                <div>
                  <div className="big-font">{user.name}</div>
                  <div className="small-font">{user.email}</div>
                  <div className="small-font">{user.screenname}</div>
                </div>

                <div className="flex">
                  <Link to={`/admin/${adminid}/user/${user._id}`}><button>Edit</button></Link>
                </div>
              </li>
            ))
          }
        </ul>
      </div>
    )
  }
}

export default AdminList;
