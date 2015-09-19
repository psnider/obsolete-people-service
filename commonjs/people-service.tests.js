/// <reference path='../../../typings/node/node.d.ts' />
/// <reference path="../../../typings/es6-promise/es6-promise.d.ts" />
/// <reference path='../../../typings/mocha/mocha.d.ts' />
/// <reference path='../../../typings/chai/chai.d.ts' />
/// <reference path="../../../typings/seneca/seneca.d.ts"/>
/// <reference path='../../../typings/people-service/Person.d.ts' />
/// <reference path='../../../typings/people-service/people-protocol.d.ts' />
var CHAI = require('chai');
var expect = CHAI.expect;
var SENECA = require('seneca');
describe('people-service', function () {
    var seneca;
    before(function (done) {
        seneca = SENECA({
            log: 'silent',
            default_plugins: {
                'mem-store': true
            },
            debug: {
                undead: true
            },
            people: {}
        });
        var people_plugin = require('people-plugin');
        seneca.use(people_plugin);
        seneca.error(function (error) {
            done(error);
        });
        done();
    });
    describe('people-plugin', function () {
        function getPerson(id) {
            var person = {
                account_email: 'bob@test.co',
                account_status: 'invitee',
                //role:              'user',
                name: { given: 'Bob', family: 'Smith' },
                locale: 'en_US',
                time_zone: 'America/Los_Angeles',
                contact_methods: [{ method: 'mobile', address: '(800) bob-smit' }]
            };
            if (id)
                person.id = id;
            return person;
        }
        function createPerson(person, done) {
            var create_msg = {
                role: 'people',
                action: 'create',
                person: person
            };
            seneca.act(create_msg, function (error, response) {
                done(error, response);
            });
        }
        function readPerson(id, done) {
            var read_msg = {
                role: 'people',
                action: 'read',
                person: { id: id }
            };
            seneca.act(read_msg, function (error, response) {
                done(error, response);
            });
        }
        function updatePerson(person, done) {
            var udpate_msg = {
                role: 'people',
                action: 'update',
                person: person
            };
            seneca.act(udpate_msg, function (error, response) {
                done(error, response);
            });
        }
        function deletePerson(id, done) {
            var delete_msg = {
                role: 'people',
                action: 'delete',
                person: { id: id }
            };
            seneca.act(delete_msg, function (error, response) {
                done(error, response);
            });
        }
        describe('action:create', function () {
            it('should create a new Person', function (done) {
                var PERSON = getPerson();
                createPerson(PERSON, function (error, response) {
                    if (!error) {
                        expect(response).to.not.have.property('error');
                        var person = response.person;
                        expect(person).to.not.equal(PERSON);
                        expect(person).to.have.property('id');
                        expect(PERSON).to.not.have.property('id');
                        expect(person).to.have.deep.property('name', PERSON.name);
                    }
                    done(error);
                });
            });
            it('should not modify the original Person', function (done) {
                var PERSON = getPerson();
                createPerson(PERSON, function (error, response) {
                    if (!error) {
                        expect(PERSON).to.not.have.property('id');
                    }
                    done(error);
                });
            });
            it('should return an error if the Person contains an ID', function (done) {
                var PERSON = getPerson('1');
                createPerson(PERSON, function (error, response) {
                    if (!error) {
                        expect(response).to.not.have.property('person');
                        expect(response.error.message).to.equal('person.id isnt allowed for create');
                    }
                    done(error);
                });
            });
        });
        describe('action:read', function () {
            function testRead(done, args) {
                var PERSON = getPerson();
                createPerson(PERSON, function (error, response) {
                    if (!error) {
                        expect(response).to.not.have.property('error');
                        var id = (args.use_created_id ? response.person.id : args.test_id);
                        readPerson(id, function (error, response) {
                            if (!error) {
                                args.tests(id, response);
                                done();
                            }
                            else {
                                done(error);
                            }
                        });
                    }
                    else {
                        done(error);
                    }
                });
            }
            it('should return a Person when the id is valid', function (done) {
                testRead(done, { use_created_id: true, tests: function (id, response) {
                        expect(response).to.not.have.property('error');
                        expect(response.person).to.have.property('id', id);
                    } });
            });
            it('should return an error when the request is missing the id', function (done) {
                testRead(done, { test_id: undefined, tests: function (id, response) {
                        expect(response).to.not.have.property('person');
                        expect(response.error.message).to.equal('person.id was not set or is invalid');
                    } });
            });
            it('should return an error when the id doesnt reference a Person', function (done) {
                var query_id = 'not-a-likely-id';
                testRead(done, { test_id: query_id, tests: function (id, response) {
                        expect(response).to.not.have.property('person');
                        expect(response.error.message).to.equal('no person for id=' + query_id);
                    } });
            });
        });
        describe('action:update', function () {
            function testUpdate(done, args) {
                var PERSON = getPerson();
                createPerson(PERSON, function (error, response) {
                    if (!error) {
                        expect(response).to.not.have.property('error');
                        var person = response.person;
                        args.update(person);
                        updatePerson(person, function (error, response) {
                            if (!error) {
                                args.tests(response);
                            }
                            else {
                                done(error);
                            }
                        });
                    }
                    else {
                        done(error);
                    }
                });
            }
            it('should update a Person when the id is valid', function (done) {
                testUpdate(done, {
                    update: function (person) {
                        person.contact_methods.push({ method: 'twitter', address: 'bobsmith' });
                    },
                    tests: function (response) {
                        expect(response).to.not.have.property('error');
                        expect(response.person.contact_methods).to.deep.equal([{ method: 'mobile', address: '(800) bob-smit' }, { method: 'twitter', address: 'bobsmith' }]);
                        done();
                    }
                });
            });
            // same as above test, but id is unset
            it('should return an error when the request is missing the id', function (done) {
                testUpdate(done, {
                    update: function (person) {
                        person.id = undefined;
                        person.contact_methods.push({ method: 'twitter', address: 'bobsmith' });
                    },
                    tests: function (response) {
                        expect(response).to.not.have.property('person');
                        expect(response.error.message).to.deep.equal('person.id was not set or is invalid');
                        done();
                    }
                });
            });
            it('should return an error when the id doesnt reference a Person', function (done) {
                var query_id = 'not-a-likely-id';
                testUpdate(done, {
                    update: function (person) {
                        person.id = query_id;
                        person.contact_methods.push({ method: 'twitter', address: 'bobsmith' });
                    },
                    tests: function (response) {
                        expect(response).to.not.have.property('person');
                        expect(response.error.message).to.deep.equal('no person for id=' + query_id);
                        done();
                    }
                });
            });
            it('subsequent read should get the update', function (done) {
                testUpdate(done, {
                    update: function (person) {
                        person.contact_methods.push({ method: 'twitter', address: 'bobsmith' });
                    },
                    tests: function (response) {
                        readPerson(response.person.id, function (error, response) {
                            if (!error) {
                                expect(response).to.not.have.property('error');
                                expect(response.person.contact_methods).to.deep.equal([{ method: 'mobile', address: '(800) bob-smit' }, { method: 'twitter', address: 'bobsmith' }]);
                                done();
                            }
                            else {
                                done(error);
                            }
                        });
                    }
                });
            });
        });
        describe('action:delete', function () {
            function testDelete(done, args) {
                var PERSON = getPerson();
                createPerson(PERSON, function (error, response) {
                    if (!error) {
                        expect(response).to.not.have.property('error');
                        var id = (args.use_created_id ? response.person.id : args.test_id);
                        deletePerson(id, function (error, response) {
                            if (!error) {
                                args.tests(id, response);
                            }
                            else {
                                done(error);
                            }
                        });
                    }
                    else {
                        done(error);
                    }
                });
            }
            it('should return null when the id is valid', function (done) {
                testDelete(done, { use_created_id: true,
                    tests: function (id, response) {
                        expect(response).to.not.have.property('error');
                        expect(response).to.have.property('person', null);
                        done();
                    }
                });
            });
            it('should not be able to read after delete', function (done) {
                testDelete(done, { use_created_id: true,
                    tests: function (id, response) {
                        readPerson(id, function (error, response) {
                            if (!error) {
                                expect(response.person).to.not.exist;
                                expect(response.error.message).to.equal('no person for id=' + id);
                                done();
                            }
                            else {
                                done(error);
                            }
                        });
                    }
                });
            });
            it('should return an error when the request is missing the id', function (done) {
                testDelete(done, { test_id: undefined,
                    tests: function (id, response) {
                        expect(response).to.not.have.property('person');
                        expect(response.error.message).to.equal('person.id was not set or is invalid');
                        done();
                    }
                });
            });
            // as of seneca 0.6.5, remove$() returns null for an invalid ID
            it('should return null when the id doesnt reference a Person', function (done) {
                var query_id = 'not-a-likely-id';
                testDelete(done, { test_id: query_id,
                    tests: function (id, response) {
                        expect(response).to.not.have.property('error');
                        expect(response).to.have.property('person', null);
                        done();
                    }
                });
            });
        });
    });
});
