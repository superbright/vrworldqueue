var _second = 1000;
var _minute = _second * 60;
var _hour = _minute * 60;
var _day = _hour * 24;
var timer;

function showRemaining(end) {
  var now = new Date();
  var distance = end - now;

  var minutes = Math.floor((distance % _hour) / _minute);
  var seconds = Math.floor((distance % _minute) / _second);

  return [minutes, seconds];
}

export default showRemaining;
