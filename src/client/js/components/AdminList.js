import React, { Component } from 'react';

class AdminList extends Component {
  componentWillMount() {
    return fetch('/api/users', {
      method: 'get',
    }).then((res) => {
      console.log(res);
      return res.json()
    }).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log('error', err);
    });
  }

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
