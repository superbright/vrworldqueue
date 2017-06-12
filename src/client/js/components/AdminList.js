import React from 'react';
import { Link } from 'react-router-dom';

const AdminList = ({ users, match: { params: { adminid } } }) => (
  <div>
    <div className="user-search simple-container">
      <input type="text" placeholder="Search Users" />
    </div>

    <ul>
      {
        users.map(user => (
          <li
            className="user-list-item flex space-between align-center"
            key={user._id}
          >
            <div>
              <div className="big-font">{user.name}</div>
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

export default AdminList;
