# VR WORLD REGISTRATION
ES6/ES2015   node.js, socket.io, gulp, webpack (for client) and babel (for server).


# Run
npm install
gulp watch

# API Docs
base endpoint is /api all others are subdomains of that

## Users
#### GET /users
Returns a list of all users

#### GET /users/[userId]
Returns the record for the given user id if it exists, otherwise returns a message indicating the user is not found

#### POST /users
Upserts user. Use this endpoint to create a new user or update an existing one

x-www-form-urlencoded fields:
* firstname [string]
* lastname [string]
* email [string]
* phone [string]
* screenname [string]
* TODO: triedvr [bool]

#### DELETE /users/[userId]
Deleteds record of user with given ID if it exists. Otherwise returns message indicating user is not found.

## Bays
#### GET /bays
Returns a list of all bays

#### GET /bays/[bayId]
Returns the record for the given bay id if it exists, otherwise returns a message indicating the user is not found

#### POST /bays
Upserts bay. Use this endpoint to create a new bay or update an existing one.

form data:
* name [string]
* id [number]

#### POST /bays/[bayId]/enqueue
Adds a user to the bay associated with bayId, if the user and the bay exist.

form data:
* userId [ObjectId]

#### DELETE /bays/[bayId]
Deleteds record of bay with given ID if it exists. Otherwise returns message indicating bay is not found. (also deletes signature if it exists.


