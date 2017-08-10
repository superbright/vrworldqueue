import React, { Component } from 'react';

export default class DatePicker extends Component {
  constructor(props) {
    super(props);

    this.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.maxDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  }

  render() {
    const { value: { month, date, year }, handleChange } = this.props;
    const maxDay = month !== '' ? this.maxDays[month] : 0;
    const curYear = new Date().getFullYear();
    const pleaseSelect = <option key={''}>Select...</option>;

    const monthOptions = this.months.map((name, num) => {
      return <option key={num} value={num}>{name}</option>;
    });


    const dayOptions = [...Array(maxDay).keys()].map((i) => {
      return <option key={i+1} value={i+1}>{i+1}</option>
    });

    const yearOptions = [...Array(100).keys()].map((i) => {
      return <option key={curYear-i} value={curYear-i}>{curYear-i}</option>
    });

    monthOptions.unshift(pleaseSelect);
    dayOptions.unshift(pleaseSelect);
    yearOptions.unshift(pleaseSelect);
    
    return (
      <div className='form-group'>
        <label>Date of Birth</label>
        <span>Month: </span>
        <select name='dob.month' value={month} onChange={handleChange}>
          {monthOptions}
        </select>
        <span>Day: </span>
        <select name='dob.date' value={date} onChange={handleChange}>
          {dayOptions}
        </select>
        <span>Year: </span>
        <select name='dob.year' value={year} onChange={handleChange}>
          {yearOptions}
        </select>
      </div>
    );
  }
}
