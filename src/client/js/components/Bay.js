import React, { Component } from 'react';

class Bay extends Component {
  constructor() {
    super();

    this.state = {
      bay: null,
    }
  }

  componentWillMount() {
    const { match: { params: { bayid } } } = this.props;
    return fetch(`/api/bays/${bayid}`, {
      method: 'get',
    }).then(res => res.json()).then((bay) => {
      this.setState({ bay });
    }).catch((err) => {
      console.log('error', err);
    });
  }

  render() {
    const { bay } = this.state;
    const { match: { params: { bayid } } } = this.props;

    return (
      <div key={bayid}>
        {
          bay &&
          (
            <div>
              <header className="flex space-between align-center">
                <h5>{bay.name}</h5>
              </header>

              <div>

              </div>
            </div>
          )
        }
      </div>
    );
  }
}

export default Bay;
