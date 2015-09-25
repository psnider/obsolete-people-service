/// <reference path='../../../typings/angularjs/angular.d.ts' />
/// <reference path='../../../typings/mocha/mocha.d.ts' />
/// <reference path='../../../typings/request/request.d.ts' />
/// <reference path='../../../typings/chai/chai.d.ts' />
/// <reference path='../../../typings/people-service/people.service.d.ts' />
var request = require('request');
var chai = require('chai');
var expect = chai.expect;
var SERVICE_URL = 'http://localhost:3000/api/people';
describe('people API', function () {
    function createPerson(person, done) {
        var data = { action: 'create', person: person };
        var options = {
            uri: SERVICE_URL,
            method: 'POST',
            json: data
        };
        request.post(options, function (error, response, body) {
            if (error) {
                done(error);
            }
            else {
                if (response.statusCode == 200) {
                    expect(body.person.id).to.exist;
                    done(null, body);
                }
                else {
                    done(new Error('response.statusCode=' + response.statusCode));
                }
            }
        });
    }
    function readPerson(id, done) {
        var data = { action: 'read', person: { id: id } };
        var options = {
            uri: SERVICE_URL,
            method: 'POST',
            json: data
        };
        request.post(options, function (error, response, body) {
            if (error) {
                done(error);
            }
            else {
                if (response.statusCode == 200) {
                    expect(body.person.id).to.equal(id);
                    done(null, body);
                }
                else {
                    done(new Error('response.statusCode=' + response.statusCode));
                }
            }
        });
    }
    function updatePerson(person, done) {
        var id = person.id;
        var data = { action: 'update', person: person };
        var options = {
            uri: SERVICE_URL,
            method: 'POST',
            json: data
        };
        request.post(options, function (error, response, body) {
            if (error) {
                done(error);
            }
            else {
                if (response.statusCode == 200) {
                    expect(body.person.id).to.equal(id);
                    done(null, body);
                }
                else {
                    done(new Error('response.statusCode=' + response.statusCode));
                }
            }
        });
    }
    function deletePerson(id, done) {
        var data = { action: 'delete', person: { id: id } };
        var options = {
            uri: SERVICE_URL,
            method: 'POST',
            json: data
        };
        request.post(options, function (error, response, body) {
            if (error) {
                done(error);
            }
            else {
                if (response.statusCode == 200) {
                    done(null, body);
                }
                else {
                    done(new Error('response.statusCode=' + response.statusCode));
                }
            }
        });
    }
    describe('action:create', function () {
        it('should create a new Person', function (done) {
            var PERSON = { name: { given: 'Sally', family: 'Smith' } };
            createPerson(PERSON, function (error, response) {
                if (!error) {
                    expect(response).to.not.have.property('error');
                    var person = response.person;
                    expect(person).to.not.equal(PERSON);
                    expect(person).to.have.property('id');
                    expect(PERSON).to.not.have.property('id');
                    expect(person.name).to.deep.equal(PERSON.name);
                }
                done(error);
            });
        });
    });
    describe('action:read', function () {
        it('should read a Person when the id is valid', function (done) {
            var PERSON = { name: { given: 'Rich', family: 'Rogers' } };
            createPerson(PERSON, function (error, response) {
                if (!error) {
                    var created_person = response.person;
                    readPerson(created_person.id, function (error, response) {
                        if (!error) {
                            expect(response).to.not.have.property('error');
                            var read_person = response.person;
                            expect(read_person).to.not.equal(PERSON);
                            expect(read_person).to.not.equal(created_person);
                            expect(read_person.id).to.equal(created_person.id);
                            expect(read_person.name).to.deep.equal(PERSON.name);
                        }
                        done(error);
                    });
                }
                else {
                    done(error);
                }
            });
        });
    });
    describe('action:update', function () {
        it('should update a Person when the id is valid', function (done) {
            var PERSON = { name: { given: 'Al', family: 'Adams' } };
            createPerson(PERSON, function (error, response) {
                if (!error) {
                    var created_person = response.person;
                    var UPDATED_PERSON = { id: created_person.id, name: { given: 'Al', family: 'Adamson' } };
                    updatePerson(UPDATED_PERSON, function (error, response) {
                        if (!error) {
                            expect(response).to.not.have.property('error');
                            var updated_person = response.person;
                            expect(updated_person).to.not.equal(created_person);
                            expect(updated_person.id).to.equal(created_person.id);
                            expect(updated_person.name).to.deep.equal(UPDATED_PERSON.name);
                        }
                        done(error);
                    });
                }
                else {
                    done(error);
                }
            });
        });
    });
    describe('action:delete', function () {
        it('should delete a Person when the id is valid', function (done) {
            var PERSON = { name: { given: 'Cal', family: 'Cool' } };
            createPerson(PERSON, function (error, response) {
                if (!error) {
                    var created_person = response.person;
                    deletePerson(created_person.id, function (error, response) {
                        if (!error) {
                            expect(response).to.not.have.property('error');
                            var deleted_person = response.person;
                            expect(deleted_person).to.not.exist;
                        }
                        done(error);
                    });
                }
                else {
                    done(error);
                }
            });
        });
    });
});
