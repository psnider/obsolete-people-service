import CHAI                 = require('chai')
const  expect               = CHAI.expect
import SENECA               = require('seneca')

import configure            = require('configure-local')
var    people_plugin        = require('people-plugin')




describe('people-plugin', function() {

    var seneca : SENECA.Instance


    before(function(done) {
        var done_called = false
        function doneOnce(error?) {
            if (!done_called) {
                done(error)
                done_called = true
            }
        }
        seneca = SENECA({
            log: 'silent',
            default_plugins:{
                'mem-store':true
            },
            debug: {
                undead: true
            },
            people: {
            }
        })
        seneca.use('seneca-entity')
        seneca.use(people_plugin)
        seneca.error((error) => {
            console.log(`seneca error=${error}`)
            doneOnce(error)
        })
        doneOnce()
    })



    function getPerson(id?: string) : Person.Person {
        let person : Person.Person = {
            account_email:     'bob@test.co',
            account_status:    'invitee',
            //role:              'user',
            name:              {given: 'Bob', family: 'Smith'},
            locale:            'en_US',
            time_zone:         'America/Los_Angeles',
            contact_methods:   [{method: 'mobile', address: '(800) bob-smit'}]
        }
        if (id) person.id = id
        return person
    }


    function createPerson(person: Person.Person, done: (error: Error, response: PeopleProtocol.Response) => void)  {
        let create_msg : PeopleProtocol.Request = {
            role: 'people',
            action: 'create',
            person: person
        }
        seneca.act(create_msg, (error, response) => {
            done(error, response)
        })
    }


    function readPerson(id: string, done: (error: Error, response: PeopleProtocol.Response) => void)  {
        let read_msg = {
            role: 'people',
            action: 'read',
            person: {id: id}
        }
        seneca.act(read_msg, (error, response) => {
            done(error, response)
        })
    }


    function updatePerson(person: Person.Person, done: (error: Error, response: PeopleProtocol.Response) => void)  {
        let udpate_msg = {
            role: 'people',
            action: 'update',
            person: person
        }
        seneca.act(udpate_msg, (error, response) => {
            done(error, response)
        })
    }


    function deletePerson(id: string, done: (error: Error, response: PeopleProtocol.Response) => void)  {
        let delete_msg = {
            role: 'people',
            action: 'delete',
            person: {id: id}
        }
        seneca.act(delete_msg, (error, response) => {
            done(error, response)
        })
    }


    describe('action:create', function() {

        it('should create a new Person', function(done) {
            const PERSON = getPerson()
            createPerson(PERSON, (error, response) => {
                if (!error) {
                    expect(response).to.not.have.property('error')
                    let person = response.person
                    expect(person).to.not.equal(PERSON)
                    expect(person).to.have.property('id')
                    expect(PERSON).to.not.have.property('id')
                    expect(person.name).to.deep.equal(PERSON.name)
                }
                done(error)
            })
        })


        it('should not modify the original Person', function(done) {
            const PERSON = getPerson()
            createPerson(PERSON, (error, response) => {
                if (!error) {
                    expect(PERSON).to.not.have.property('id')
                }
                done(error)
            })
        })


        it('should return an error if the Person contains an ID', function(done) {
            const PERSON = getPerson('1')
            createPerson(PERSON, (error, response) => {
                if (!error) {
                    expect(response).to.not.have.property('person')
                    expect(response.error.message).to.equal('person.id isnt allowed for create')
                }
                done(error)
            })
        })

    })


    describe('action:read', function() {

        function testRead(done: (error?: Error) => void, args: {use_created_id?: boolean, test_id?: string, tests: (id: string, response: PeopleProtocol.Response) => void}) {
            const PERSON = getPerson()
            createPerson(PERSON, (error, response) => {
                if (!error) {
                    expect(response).to.not.have.property('error')
                    const id = (args.use_created_id ? response.person.id : args.test_id)
                    readPerson(id, (error, response) => {
                        if (!error) {
                            args.tests(id, response)
                            done()
                        } else {
                            done(error)
                        }
                    })
                } else {
                    done(error)
                }
            })
        }


        it('should return a Person when the id is valid', function(done) {
            testRead(done, {use_created_id: true, tests: (id, response) => {
                expect(response).to.not.have.property('error')
                expect(response.person).to.have.property('id', id)
            }})
        })


        it('should return an error when the request is missing the id', function(done) {
            testRead(done, {test_id: undefined, tests: (id, response) => {
                expect(response).to.not.have.property('person')
                expect(response.error.message).to.equal('person.id was not set or is invalid')
            }})
        })


        it('should return an error when the id doesnt reference a Person', function(done) {
            const query_id = 'not-a-likely-id'
            testRead(done, {test_id: query_id, tests: (id, response) => {
                expect(response).to.not.have.property('person')
                expect(response.error.message).to.equal('no person for id=' + query_id)
            }})
        })

    })


    describe('action:update', function() {

        function testUpdate(done: (error?: Error) => void, args: {update: (person: Person.Person) => void, tests: (response: PeopleProtocol.Response) => void}) {
            const PERSON = getPerson()
            createPerson(PERSON, (error, response) => {
                if (!error) {
                    expect(response).to.not.have.property('error')
                    let person = response.person
                    args.update(person)
                    updatePerson(person, (error, response) => {
                        if (!error) {
                            args.tests(response)
                        } else {
                            done(error)
                        }
                    })
                } else {
                    done(error)
                }
            })
        }


        it('should update a Person when the id is valid', function(done) {
            testUpdate(done, {
                update: (person: Person.Person) => {
                    person.contact_methods.push({method: 'twitter', address: 'bobsmith'})
                },
                tests: (response: PeopleProtocol.Response) => {
                    expect(response).to.not.have.property('error')
                    expect(response.person.contact_methods).to.deep.equal([{method: 'mobile', address: '(800) bob-smit'}, {method: 'twitter', address: 'bobsmith'}])
                    done()
                }
            })
        })



        // same as above test, but id is unset
        it('should return an error when the request is missing the id', function(done) {
            testUpdate(done, {
                update: (person: Person.Person) => {
                    person.id = undefined
                    person.contact_methods.push({method: 'twitter', address: 'bobsmith'})
                },
                tests: (response: PeopleProtocol.Response) => {
                    expect(response).to.not.have.property('person')
                    expect(response.error.message).to.deep.equal('person.id was not set or is invalid')
                    done()
                }
            })
        })


        it('should return an error when the id doesnt reference a Person', function(done) {
            const query_id = 'not-a-likely-id'
            testUpdate(done, {
                update: (person: Person.Person) => {
                    person.id = query_id
                    person.contact_methods.push({method: 'twitter', address: 'bobsmith'})
                },
                tests: (response: PeopleProtocol.Response) => {
                    expect(response).to.not.have.property('person')
                    expect(response.error.message).to.deep.equal('no person for id=' + query_id)
                    done()
                }
            })
        })


        it('subsequent read should get the update', function(done) {
            testUpdate(done, {
                update: (person: Person.Person) => {
                    person.contact_methods.push({method: 'twitter', address: 'bobsmith'})
                },
                tests: (response: PeopleProtocol.Response) => {
                    readPerson(response.person.id, (error, response) => {
                        if (!error) {
                            expect(response).to.not.have.property('error')
                            expect(response.person.contact_methods).to.deep.equal([{method: 'mobile', address: '(800) bob-smit'}, {method: 'twitter', address: 'bobsmith'}])
                            done()
                        } else {
                            done(error)
                        }
                    })
                }
            })
        })

    })


    describe('action:delete', function() {

        function testDelete(done: (error?: Error) => void, args: {use_created_id?: boolean, test_id?: string, tests: (id: string, response: PeopleProtocol.Response) => void}) {
            const PERSON = getPerson()
            createPerson(PERSON, (error, response) => {
                if (!error) {
                    expect(response).to.not.have.property('error')
                    const id = (args.use_created_id ? response.person.id : args.test_id)
                    deletePerson(id, (error, response) => {
                        if (!error) {
                            args.tests(id, response)
                        } else {
                            done(error)
                        }
                    })
                } else {
                    done(error)
                }
            })
        }


        it('should return null when the id is valid', function(done) {
            testDelete(done, {use_created_id: true,
                tests: (id, response: PeopleProtocol.Response) => {
                    expect(response).to.not.have.property('error')
                    expect(response).to.have.property('person', null)
                    done()
                }
            })
        })


        it('should not be able to read after delete', function(done) {
            testDelete(done, {use_created_id: true,
                tests: (id, response: PeopleProtocol.Response) => {
                    readPerson(id, (error, response) => {
                        if (!error) {
                            expect(response.person).to.not.exist
                            expect(response.error.message).to.equal('no person for id=' + id)
                            done()
                        } else {
                            done(error)
                        }
                    })
                }
            })
        })


        it('should return an error when the request is missing the id', function(done) {
            testDelete(done, {test_id: undefined,
                tests: (id, response: PeopleProtocol.Response) => {
                    expect(response).to.not.have.property('person')
                    expect(response.error.message).to.equal('person.id was not set or is invalid')
                    done()
                }
            })
        })


        // as of seneca 0.6.5, remove$() returns null for an invalid ID
        it('should return null when the id doesnt reference a Person', function(done) {
            const query_id = 'not-a-likely-id'
            testDelete(done, {test_id: query_id,
                tests: (id, response: PeopleProtocol.Response) => {
                    expect(response).to.not.have.property('error')
                    expect(response).to.have.property('person', null)
                    done()
                }
            })
        })

    })

})
