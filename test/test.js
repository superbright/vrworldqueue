var assert = require('assert');
var supertest = require('supertest');
var testCase = require('mocha').describe;
var agent = supertest.agent('http://localhost:3000');
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
        agent.get('/').end((err, res) => {
            console.log(res);
        })
    });
});