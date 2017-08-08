import React, { Component } from 'react';
import debounce from 'lodash/debounce';
import { Link } from 'react-router-dom';

class AdminList extends Component {
  constructor(props) {
    super(props);

    this.updateSearch = this.updateSearch.bind(this);
    this.filterUsers = this.filterUsers.bind(this);
    this.updateFilter = debounce(this.updateFilter.bind(this), 1000);

    this.state = {
      filteredUsers: props.users ? this.sortUsers(props.users) : [],
      searchValue: '',
    };
  }

  sortUsers(users) {
    return users.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  updateSearch(e) {
    const { target : { value }} = e;

    this.setState({searchValue: value});
    this.updateFilter();
  }

  updateFilter() {
    this.setState({ filteredUsers: this.filterUsers() });
  }

  filterUsers() {
    const { searchValue } = this.state;
    const { users } = this.props;
    const value = searchValue.toLowerCase();

    const sortedUsers = this.sortUsers(users);

    return searchValue
      ? sortedUsers.filter(u => (
        u.firstname && u.lastname &&
        `${u.firstname.toLowerCase()} ${u.lastname.toLowerCase()}`.indexOf(value) >= 0
        || (
          u.email &&
          u.email.toLowerCase().indexOf(value) >= 0
        )
      ))
      : sortedUsers;
  }

  render() {
    const { searchValue, filteredUsers } = this.state;
    const { getUsers, match: { params: { adminid } } } = this.props;

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
            filteredUsers.slice(0, 50).map(user => (
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
