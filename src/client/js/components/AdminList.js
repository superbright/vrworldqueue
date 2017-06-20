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
    const value = searchValue.toLowerCase();
    console.log(users);
    // const sortedUsers = users.sort((a, b) => {
    //   return new Date(b.date) - new Date(a.date);
    // });

    return searchValue
      ? users.filter(u => (
        `${u.firstname.toLowerCase()} ${u.lastname.toLowerCase()}`.indexOf(value) >= 0
        || (
          u.email &&
          u.email.toLowerCase().indexOf(value) >= 0
        )
      ))
      : users;
  }

  render() {
    const { searchValue } = this.state;
    const { getUsers, match: { params: { adminid } } } = this.props;

    const filteredUsers = this.filterUsers();

    return (
      <div>
        <header className="flex space-between align-center">
          <h5>vrworld admin {adminid}</h5>
        </header>

        <div className="user-search simple-container">
          <input type="text" placeholder="Search Users" onChange={this.updateSearch} value={searchValue} />
        </div>

        <div className="simple-container">
          <button onClick={getUsers}>Refresh List</button>
        </div>

        <ul>
          {
            filteredUsers.map(user => (
              <li
                className="user-list-item flex space-between align-center"
                key={user._id}
              >
                <div>
                  <div className="big-font">{user.firstname} {user.lastname}</div>
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
    );
  }
}

export default AdminList;
