/**
 * Usage: node phake.js game 4 http://10.10.0.165:3000
 * Then tag #
 */
'use strict';
const io = require('socket.io-client');
const inquirer = require('inquirer');

const args = process.argv;
const clientType = args[2] || 'game';
const clientId = args[3] || '1';
const url = args[4] || 'http://localhost:3000';

const socket = io(url, {
  query: `clientType=${clientType}&clientId=${clientId}`
});

console.log(`connected to ${url} as ${clientType} #${clientId}\nEnter tag # or 'exit' to exit.`);

p({
  name: 'socket',
  message: '> '
});

function p(prompt) {
  return inquirer.prompt([prompt], function (answer) {
    if (answer[prompt.name] === 'exit') {
      socket.disconnect();
      process.exit();
    }
    const tag = answer[prompt.name] || '1234567890';
    prompt.default = tag;
    socket.emit('rfid', JSON.stringify({
      clientType,
      clientId,
      tag
    }));
    p(prompt);
  })
}