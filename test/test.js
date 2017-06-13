var assert = require('assert');
var supertest = require('supertest');
var testCase = require('mocha').describe;
var agent = supertest.agent('http://localhost:3000');
var should = require("chai").should();
var expect = require("chai").expect;
//var async = require("async");

//var app = require('../src/server/server');
//var express = require('express');
////
//
//  User Account Tests
//
////
//testCase('User', function () {
//    var userapi = supertest
//    it('should return a 200 response', function (done) {
//        api.get('/users')
//            //            .set('Accept', 'applications/json')
//            .expect(200, done)
//    })
//});

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

var userId;
describe('User', function() {
    // TODO: GET /:userId/signature

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
    //            console.log(res.body.rfid);
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

// Uncaught AssertionError: expected Tue, 13 Jun 2017 04:00:00 GMT to equal Tue, 13 Jun 2017 04:00:00 GMT
/*    it('should automatically set the correct expiration date', function(done) {
        agent
            .get('/api/users/' + userId)
            .expect(200)
            .end(function(err, res) {
                var expectedDate = new Date(new Date().setHours(24, 0, 0, 0));
                expect(new Date(res.body.rfid.expiresAt)).to.equal(expectedDate);
                if (err) return done(err)
                done();
            });
    });*/

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

var bayId;
describe('Bay', function() {
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
    var userId_01;
    it('should enqueue user', function(done) {
        // Add user
        agent
            .post('/api/users')
            .send({
                firstname: "Sample",
                lastname: "Example",
                email: "nope@no.nah",
                phone: "1234567890",
                screenname: "aloe",
                rfid: '1'
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err)
                userId_01 = res.body._id;
                agent
                    .post('/api/bays/' + bayId + '/enqueue')
                    .set('Accept', 'applications/json')
                    .send({
                        userId: userId_01
                    })
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        expect(res.body.queue[0].user).to.equal(userId_01);
                        if (err) return done(err)
                        done();
                    });
            });
    });

    it('should throw 404 error', function(done) {
        agent
            .post('/api/bays/' + bayId + '/enqueue')
            .set('Accept', 'applications/json')
            .send({
                userId: userId_01
            })
            .expect(404)
            .end(function(err, res) {
                if (err) return done(err)
                done();
            });
    });

    it('should dequeue user', function(done) {
        agent
            .get('/api/bays/' + bayId + '/dequeue')
            .set('Accept', 'applications/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                expect(res.body.user).to.equal(userId_01);
                agent
                    .get('/api/bays/' + bayId)
                    .end(function(err, res) {
                        expect(res.body.queue.length).to.equal(0);
                        if (err) return done(err)
                        done();
                    });
            });





/*
        async.series([
            function(callback) {
                agent
                    .get('/api/bays/' + bayId + '/dequeue')
                    .set('Accept', 'applications/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        expect(res.body.user).to.equal("593dbd5e2c139429db49d0dc");
                    });

                    console.log("asdfg");
                    callback();

                //callback();
            },
            function(callback) {
                agent
                    .get('/api/bays/' + bayId)
                    .end(function(err, res) {
                        expect(res.body.queue.length).to.equal(0);
                    });

                    callback();
                    console.log("1234");
                //callback(null, expect(res.body.queue.length).to.equal(0));
            }
        ], done());*/






        
    });

    // Boilerplate to test multiple enqueues    
    it('should dequeue oldest user and newest user should still be in queue', function(done) {
        agent
            .post('/api/bays/' + bayId + '/enqueue')
            .send({ userId: "593dbd5e2c139429db49d0dc" })
            .end(function() {
                agent
                    .post('/api/bays/' + bayId + '/enqueue')
                    .send({ userId: "593dbd5b2c139429db49d0d9" })
                    .end(function() {
                        agent
                            .get('/api/bays/' + bayId + '/dequeue')
                            .set('Accept', 'applications/json')
                            .expect('Content-Type', /json/)
                            .expect(200)
                            .end(function(err, res) {
                                expect(res.body.user).to.equal("593dbd5e2c139429db49d0dc");
                                agent
                                    .get('/api/bays/' + bayId)
                                    .end(function(err, res) {
                                        expect(res.body.queue[0].user).to.equal("593dbd5b2c139429db49d0d9");
                                        if (err) return done(err)
                                        done();
                                    });
                            });
                    });
            });

/*        async.series([
            function(callback) {
                agent
                    .post('/api/bays/' + bayId + '/enqueue')
                    .send({ userId: "593dbd5e2c139429db49d0dc" })
                    .end(callback)
            },
            function(callback) {
                agent
                    .post('/api/bays/' + bayId + '/enqueue')
                    .send({ userId: "593dbd5b2c139429db49d0d9" })
                    .end(callback)
            },
            function(callback) {
                agent
                    .get('/api/bays/' + bayId + '/dequeue')
                    .set('Accept', 'applications/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        expect(res.body.user).to.equal("593dbd5e2c139429db49d0dc");
                    })
            }
        ]);

        agent
            .get('/api/bays/' + bayId)
            .end(function(err, res) {
                console.log(res.body)
                expect(res.body.queue[0].user).to.equal("593dbd5b2c139429db49d0d9");
                if (err) return done(err)
                done();
            });*/



    });


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