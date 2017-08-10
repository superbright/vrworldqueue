import React, { Component } from 'react';
// import scrollIntoView from 'scroll-into-view';

class FormGroup extends Component {
  constructor() {
    super();

    this.handleFocus = this.handleFocus.bind(this);
  }

  handleFocus() {
    // scrollIntoView(this.inputRef, { time: 500 });
  }

  renderInput() {
    const { value, valueID, handleChange, handleBlur } = this.props;

    return (
      <input
        type="text"
        name={valueID}
        id={valueID}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur || this.handleBlur}
        ref={(ref) => { this.inputRef = ref; }}
      />
    );
  }

  renderSelect() {
    const { value, valueID, options, handleChange } = this.props;
    let selects = [];
    options.options.forEach((option) => {
      selects.push(<option key={option.value} value={option.value}>{option.label}</option>);
    });
    return (
      <select
        name={valueID}
        id={valueID}
        value={value}
        onChange={handleChange}
      >
        {selects}
      </select>
    );
  }

  render() {
    const { value, valueID, valueName, required, errors, type } = this.props;
    let element = '';

    if (type === 'select') {
      element = this.renderSelect();
    } else {
      element = this.renderInput();
    }

    return (
      <div>
        {
          (value || value === '') &&
          <div className="form-group">
            <label htmlFor={valueID}>{valueName} {required && <span className="small-font">*</span>}</label>
            {element}
            {errors && errors[valueID] && <div className="error-message">{errors[valueID]}</div>}
          </div>
        }
      </div>
    );
  }
}

export default FormGroup;
