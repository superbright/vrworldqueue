import React, { Component } from 'react';

class BayPlay extends Component {
  render() {
    return (
      <div className="bay-play flex justify-center align-center">
        <div className="play-button">
          <svg viewBox="0 0 200 200" alt="Play video">
            <circle cx="100" cy="100" r="90" fill="none" strokeWidth="15" stroke="#fff" />
            <polygon points="70, 55 70, 145 145, 100" fill="#fff" />
          </svg>
        </div>
      </div>
    );
  }
}

export default BayPlay;
