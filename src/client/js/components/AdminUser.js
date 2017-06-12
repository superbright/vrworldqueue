import React from 'react';
import { Link } from 'react-router-dom';

const AdminList = ({ users, match: { params: { userid, adminid } } }) => {
  const user = users.find(u => u._id === userid);

  return (
    <div className="admin-user-page simple-container">
      <Link to={`/admin/${adminid}`}>{`< Return to Users List`}</Link>
      {
        user && (
          <div className="admin-user-page-info">
            <h2>{user.name}</h2>
            <p>{user.screenname}</p>
          </div>
        )
      }
    </div>
  );
};

export default AdminList;
