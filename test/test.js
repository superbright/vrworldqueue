var assert = require('assert');
var supertest = require('supertest');
var testCase = require('mocha').describe;
var agent = supertest.agent('http://localhost:3000');
var should = require("chai").should();
var expect = require("chai").expect;

/*

    TODO:
    - Validate users
    - Make sure users cannot queue a game if they are already queued in another
    - 

*/

// GET /
describe('GET /', function () {
    it('should return home page', function (done) {
        agent
            .get('/')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err)
                done();
            });
    });
});

describe('User', function() {
    var userId;

    // GET /
    it('should return a 200 response', function(done) {
        agent
            .get('/api/users')
            .expect(200, done)
    });

    before(function(done) {
        agent
            .post('/api/users')
            .send({
                firstname: "Sample",
                lastname: "Example",
                email: "nope@no.nah",
                phone: "1234567890",
                screenname: "aloe",
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err)
                userId = res.body._id;
                done();
            });
    });

    // Validate data
    it('should be an object with keys and values', function(done) {
        agent
            .get('/api/users/' + userId)
            .expect(200)
            .end(function(err, res) {
                // when validation is implemented, add check for non-null values

                expect(res.body).to.have.property("name");
                expect(res.body).to.have.property("email");
                expect(res.body).to.have.property("phone");
                expect(res.body).to.have.property("screenname");
                done();
            });
    });

    // GET /:userId
    it('should be in the database', function(done) {
        agent
            .get('/api/users/' + userId)
            .set('Accept', 'applications/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                expect(res.body._id).to.equal(userId);
                expect(res.body.name).to.equal("Sample Example");
                expect(res.body.email).to.equal("nope@no.nah");
                expect(res.body.phone).to.equal("1234567890");
                expect(res.body.screenname).to.equal("aloe");
                done();
            });
    });

    // POST /
    it('should update the user with the same email with updated info', function(done) {
        agent
            .post('/api/users')
            .send({
                firstname: "Not",
                lastname: "Anymore",
                email: "nope@no.nah",
                phone: "0987654321",
                screenname: "eola",
                rfid: '1',
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                expect(res.body._id).to.equal(userId);
                expect(res.body.name).to.equal("Not Anymore");
                expect(res.body.email).to.equal("nope@no.nah");
                expect(res.body.phone).to.equal("0987654321");
                expect(res.body.screenname).to.equal("eola");
                expect(res.body.rfid.id).to.equal('1');
                done();
            });
    });

    // DELETE /:userId
    it('should delete user', function(done) {
        agent
            .delete('/api/users/' + userId)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err)
                done();
            });
    });
});

describe('Bay', function() {
    var bayId;
    var userId;
    var userId_01;
    var userId_02;

    // GET /
    it('should return a 200 response', function(done) {
        agent
            .get('/api/bays')
            .expect(200, done)
    });

    before(function(done) {
        agent
            .post('/api/bays')
            .send({
                id: 0,
                name: "Capture the Flag",
                game: "wtf is the difference between all these"
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err)
                bayId = res.body._id;
                done();
            });
    });

    // Validate data
    it('should be an object with keys and values', function(done) {
        agent
            .get('/api/bays/' + bayId)
            .expect(200)
            .end(function(err, res) {
                // when validation is implemented, add check for non-null values

                expect(res.body).to.have.property("name");
                expect(res.body).to.have.property("game");
                expect(res.body).to.have.property("id");
                done();
            });
    })

    // GET /:bayId
    it('should be in the database', function(done) {
        agent
            .get('/api/bays/' + bayId)
            .set('Accept', 'applications/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                expect(res.body.id).to.equal(0);
                expect(res.body.name).to.equal("Capture the Flag");
                expect(res.body.game).to.equal("wtf is the difference between all these");
                done();
            });
    });

    // POST /:bayId/enqueue
    it('should enqueue user', function() {
        return agent
        // Create a new user
            .post('/api/users')
            .send({
                firstname: "Sample",
                lastname: "Example",
                email: "nope@no.naah",
                phone: "1234567890",
                screenname: "aloe"
            })
            .expect('Content-Type', /json/)
            .expect(200)
        // Grab new user's ID
            .then(function(res) {
                userId = JSON.parse(res.text)._id;
                return agent
                    .get('/api/users/' + userId)
                    .expect(200);
            })
        // Enqueue new user
            .then(function(res) {
                return agent
                    .post('/api/bays/' + bayId + '/enqueue')
                    .send({
                        userId: userId
                    })
                    .expect('Content-Type', /json/)
                    .expect(200)
            })
        // Make sure the first queued user is the right one
            .then(function(res) {
                assert(res.body.queue[0].user === userId, 'got the same ID back');
            })
    });

    // Testing whether or not user is already in queue for the same bay
    it('should throw 404 error', function(done) {
        agent
            .post('/api/bays/' + bayId + '/enqueue')
            .set('Accept', 'applications/json')
            .send({
                userId: userId
            })
            .expect(404)
            .end(function(err, res) {
                if (err) return done(err)
                done();
            });
    });

    // GET /:bayId/dequeue
    it('should dequeue user', function(done) {
        agent
            .get('/api/bays/' + bayId + '/dequeue')
            .set('Accept', 'applications/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                expect(res.body.user).to.equal(userId);
                agent
                    .get('/api/bays/' + bayId)
                    .end(function(err, res) {
                        expect(res.body.queue.length).to.equal(0);
                        if (err) return done(err)
                        done();
                    });
            });
    });

    // Test multiple enqueues and dequeue then make sure the right ones are dequeued and the queue still has the right users left
    it('should dequeue oldest user and newest user should still be in queue', function() {
            return agent
            // Create a new user
                .post('/api/users')
                .send({
                    firstname: "Sample",
                    lastname: "Example",
                    email: "nope@no.naah",
                    phone: "1234567890",
                    screenname: "aloe"
                })
                .expect('Content-Type', /json/)
                .expect(200)
            // Grab new user's ID
                .then(function(res) {
                    userId_01 = res.body._id;
                })
            // Create a new user again
                .then(function() {
                    return agent
                    .post('/api/users')
                    .send({
                        firstname: "Sample",
                        lastname: "Example",
                        email: "nope@no.nah",
                        phone: "1234567890",
                        screenname: "aloe"
                    })
                    .expect('Content-Type', /json/)
                    .expect(200)

                })
            // Grab second new user's ID
                .then(function(res) {
                    userId_02 = res.body._id;
                })
            // Enqueue user
                .then(function() {
                    return agent
                        .post('/api/bays/' + bayId + '/enqueue')
                        .send({
                            userId: userId_01
                        })
                        .expect('Content-Type', /json/)
                        .expect(200)
                })
            // Enqueue second user
                .then(function() {
                    return agent
                        .post('/api/bays/' + bayId + '/enqueue')
                        .send({
                            userId: userId_02
                        })
                        .expect('Content-Type', /json/)
                        .expect(200)
                })
            // Dequeue user
                .then(function() {
                    return agent
                        .get('/api/bays/' + bayId + '/dequeue')
                        .set('Accept', 'applications/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                })
            // Make sure right user was dequeued then grab bay info
                .then(function(res) {
                    assert(res.body.user === userId_01, 'first user was dequeued');
                    return agent
                        .get('/api/bays/' + bayId)
                        .expect('Content-Type', /json/)
                        .expect(200)
                })
            // Make sure second user is still in queue
                .then(function(res) {
                    assert(res.body.queue[0].user === userId_02, 'second user still in queue');
                })
    });

    // DELETE /:bayId/queue
    it('should clear queue', function() {
        return agent
        // Enqueue another user to the queue for further testing
            .post('/api/bays/' + bayId + '/enqueue')
            .send({
                userId: userId_01
            })
            .expect('Content-Type', /json/)
            .expect(200)
        // Grab bay info
            .then(function(res) {
                return agent
                    .get('/api/bays/' + bayId)
                    .expect('Content-Type', /json/)
                    .expect(200)
            })
        // Check to see if the queue count is right then clear
            .then(function(res) {
                assert(res.body.queue.length === 2, 'queue should have 2 users');
                return agent
                    .delete('/api/bays/' + bayId + '/queue')
                    .expect(200)
            })
        // Make sure queue is empty
            .then(function(res) {
                assert(res.body.queue.length === 0, 'queue should be empty')
            })
    })

    // DELETE /:bayId
    it('should delete bay', function(done) {
        agent
            .delete('/api/bays/' + bayId)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err)
                done();
            });
    });

});