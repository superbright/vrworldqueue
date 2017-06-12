import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import AdminList from './AdminList';

const NoId = () => <div>No Admin ID in route, try: /admin/*ADMIN_ID*</div>;

class Admin extends Component {
  render() {
    const { match } = this.props;

    return (
      <div>
        <header className="flex space-between align-center">
          <h2>vrworld admin</h2>
        </header>

        <Route path={`${match.url}/:id`} component={AdminList} />
        <Route exact path={match.url} component={NoId} />
      </div>
    );
  }
}

export default Admin;
