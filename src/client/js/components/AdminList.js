import React, { Component } from 'react';

class AdminList extends Component {
  constructor() {
    super();

    this.state = {
      users: [],
    }
  }

  componentWillMount() {
    return fetch('/api/users', {
      method: 'get',
    }).then((res) => res.json()).then((users) => {
      this.setState({ users });
    }).catch((err) => {
      console.log('error', err);
    });
  }

  render() {
    const { users } = this.state;
    // const { match: { params: { id } } } = this.props;

    return (
      <div>
        <div className="user-search simple-container">
          <input type="text" placeholder="search" />
        </div>

        <ul>
          {
            users.map((user) => {
              return (
                <li className="user-list-item flex space-between align-center" key={user._id}>
                  <div>
                    <div className="big-font">{user.name}</div>
                    <div className="small-font">{user.screenname}</div>
                  </div>

                  <div className="flex">
                    <button>Edit</button>
                  </div>
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  }
}

export default AdminList;
