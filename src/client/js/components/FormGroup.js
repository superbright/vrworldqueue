import React, { Component } from 'react';
import scrollIntoView from 'scroll-into-view';

class FormGroup extends Component {
  constructor() {
    super();

    this.handleFocus = this.handleFocus.bind(this);
  }

  handleFocus() {
    scrollIntoView(this.inputRef, { time: 500 });
  }

  render() {
    const { value, valueID, valueName, required, errors, handleChange } = this.props;

    return (
      <div>
        {
          (value || value === '') &&
          <div className="form-group">
            <label htmlFor={valueID}>{valueName} {required && <span className="small-font">*</span>}</label>
            <input
              type="text"
              name={valueID}
              id={valueID}
              value={value}
              onChange={handleChange}
              onFocus={this.handleFocus}
              ref={(ref) => { this.inputRef = ref }}
            />
            {errors && errors[valueID] && <div className="error-message">{errors[valueID]}</div>}
          </div>
        }
      </div>
    );
  }
}

export default FormGroup;
