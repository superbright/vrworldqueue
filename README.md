# VR WORLD REGISTRATION
ES6/ES2015   node.js, socket.io, gulp, webpack (for client) and babel (for server).


# Run
npm install
gulp watch

# API Docs

### GET /users
Returns a list of all users

### GET /users/[userId]
Returns the record for the given user id if it exists, otherwise returns a message indicating the user is not found

### POST /users
Creates a new user. TODO: Switch to upsert method based on email, name, phone, etc...

x-www-form-urlencoded fields:
* firstname [string]
* lastname [string]
* email [string]
* phone [string]
* screenname [string]
* TODO: triedvr [bool]

### DELETE /users/[userId]
Deleteds record of user with given ID if it exists. Otherwise returns message indicating user is not found.
