'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.validNick = validNick;
exports.findIndex = findIndex;
exports.sanitizeString = sanitizeString;
exports.twoAMTomorrow = twoAMTomorrow;
exports.midnightThisMorning = midnightThisMorning;
function validNick(nickname) {
    var regex = /^\w*$/;
    return regex.exec(nickname) !== null;
}

function findIndex(arr, id) {
    var len = arr.length;

    while (len--) {
        if (arr[len].id === id) {
            return len;
        }
    }

    return -1;
}

function sanitizeString(message) {
    return message.replace(/(<([^>]+)>)/ig, '').substring(0, 35);
}

function twoAMTomorrow() {
    var tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    tomorrow.setHours(tomorrow.getHours() + 2);
    return tomorrow;
}
function midnightThisMorning() {
    var yesterday = new Date();
    yesterday.setHours(0, 0, 0, 0);
    return yesterday;
}