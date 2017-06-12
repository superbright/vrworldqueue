import React, { Component } from 'react';

class AdminList extends Component {
  render() {
    const { match: { params: { id } } } = this.props;

    return (
      <div>
        AdminList: {id}
      </div>
    );
  }
}

export default AdminList;
