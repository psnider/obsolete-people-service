import HTTP_STATUS = require('http-status-codes');
import request = require('request')
import CHAI = require('chai')
const  expect = CHAI.expect

import configure = require('configure-local')




describe('people-service', function() {

    const URL = configure.get('people:service-url')
    const POST_FEED_TIMEOUT = 1 * 1000


    // This is identical to newPerson() in people-db.tests.ts
    function newPerson(id?: string) : Person.Person {
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


    type PersonCallback = (error: Error, person?: Person.Person) => void

    function post(obj, done: PersonCallback) {
        var options: request.OptionsWithUri = {
            uri: URL,
            timeout: POST_FEED_TIMEOUT,
            method: 'POST',
            json: obj
        }
        request(options, (error, response, body) => {
            // shouldnt be seeing network errors
            if (error) throw error
            if (body.error) {
                error = new Error(body.error.message)
                error.stack = body.error.stack
            }
            if (response.statusCode !== HTTP_STATUS.OK) {
                if (!error) {
                    error = new Error(`http statusCode=${response.statusCode}, ${HTTP_STATUS.getStatusText(response.statusCode)}`)
                }
                error.http_status = response.statusCode
            }
            done(error, body.person)
        })
    }


    function createPerson(person: Person.Person, done: PersonCallback)  {
        let msg : PeopleProtocol.Request = {
            action: 'create',
            person
        }
        post(msg, done)
    }


    function readPerson(id: string, done: PersonCallback) {
        let msg = {
            action: 'read',
            person: {id}
        }
        post(msg, done)
    }


    function updatePerson(person: Person.Person, done: PersonCallback) {
        let msg = {
            action: 'update',
            person
        }
        post(msg, done)
    }


    function deletePerson(id: string, done: PersonCallback) {
        let msg = {
            action: 'delete',
            person: {id}
        }
        post(msg, done)
    }


    describe('action:create', function() {

        it('should create a new Person', function(done) {
            const PERSON = newPerson()
            createPerson(PERSON, (error, person) => {
                expect(error).to.not.exist
                expect(person).to.not.equal(PERSON)
                expect(person).to.have.property('id')
                expect(person.name).to.deep.equal(PERSON.name)
                done()
            })
        })


        it('should not modify the original Person', function(done) {
            const PERSON = newPerson()
            createPerson(PERSON, (error, person) => {
                if (!error) {
                    expect(PERSON).to.not.have.property('id')
                }
                done(error)
            })
        })


        it('should return an error if the Person contains an ID', function(done) {
            const PERSON = newPerson('1')
            createPerson(PERSON, (error, person) => {
                expect(error.message).to.equal('id isnt allowed for create')
                expect(error['http_status']).to.equal(400)
                expect(person).to.not.exist
                done()
            })
        })

    })


    describe('action:read', function() {

        function testRead(options: {use_created_id?: boolean, test_id?: string}, done: (error: Error, id?: string, person?: Person.Person) => void) {
            const PERSON = newPerson()
            createPerson(PERSON, (error, created_person) => {
                if (!error) {
                    const id = (options.use_created_id ? created_person.id : options.test_id)
                    readPerson(id, (error, read_person) => {
// console.log(`testRead: error.message=${error ? error.message : undefined}`)
// console.log(`testRead: read_person=${JSON.stringify(read_person)}`)

                        done(error, id, read_person)
                    })
                } else {
                    done(error)
                }
            })
        }


        it('should return a Person when the id is valid', function(done) {
            testRead({use_created_id: true}, (error, id, person) => {
                if (!error) {
                    expect(person).to.have.property('id', id)
                }
                done(error)
            })
        })


        it('should return an error when the request is missing the id', function(done) {
            testRead({test_id: undefined}, (error, id, person) => {
                expect(error.message).to.equal('id is invalid')
                done()
            })
        })


        it('should return an error when the id doesnt reference a Person', function(done) {
            const query_id = 'not-a-likely-id'
            testRead({test_id: query_id}, (error, id, person) => {
                expect(error.message).to.equal('id is invalid')
                done()
            })
        })

    })


    describe('action:update', function() {

        function testUpdate(update: (person: Person.Person) => void, done: (error: Error, response?: Person.Person) => void) {
            const PERSON = newPerson()
            createPerson(PERSON, (error, person) => {
                if (!error) {
                    expect(error).to.not.exist
                    let created_person = person
                    update(created_person)
                    updatePerson(created_person, (error, person) => {
                        done(error, person)
                    })
                } else {
                    done(error)
                }
            })
        }


        it('should update a Person when the id is valid', function(done) {
            testUpdate(
                (person) => {
                    person.contact_methods.push({method: 'twitter', address: 'bobsmith'})
                },
                (error, updated_person) => {
                    expect(updated_person.contact_methods).to.deep.equal([{method: 'mobile', address: '(800) bob-smit'}, {method: 'twitter', address: 'bobsmith'}])
                    done()
                }
            )
        })


        // same as above test, but id is unset
        it('should return an error when the request is missing the id', function(done) {
            testUpdate(
                (person: Person.Person) => {
                    person.id = undefined
                    person.contact_methods.push({method: 'twitter', address: 'bobsmith'})
                },
                (error, updated_person) => {
                    expect(error.message).to.deep.equal('id is invalid')
                    done()
                }
            )
        })


        it('should return an error when the id doesnt reference a Person', function(done) {
            const query_id = 'not-a-likely-id'
            testUpdate(
                (person: Person.Person) => {
                    person.id = query_id
                    person.contact_methods.push({method: 'twitter', address: 'bobsmith'})
                },
                (error, updated_person) => {
                    expect(error.message).to.deep.equal('id is invalid')
                    done()
                }
            )
        })


        it('subsequent read should get the update', function(done) {
            testUpdate(
                (person: Person.Person) => {
                    person.contact_methods.push({method: 'twitter', address: 'bobsmith'})
                },
                (error, updated_person) => {
                    readPerson(updated_person.id, (error, person) => {
                        if (!error) {
                            expect(person.contact_methods).to.deep.equal([{method: 'mobile', address: '(800) bob-smit'}, {method: 'twitter', address: 'bobsmith'}])
                        }
                        done(error)
                    })
                }
            )
        })

    })


    describe('action:delete', function() {

        function testDelete(options: {use_created_id?: boolean, test_id?: string}, done: (error: Error, id?: string) => void) {
            const PERSON = newPerson()
            createPerson(PERSON, (error, person) => {
                if (!error) {
                    expect(error).to.not.exist
                    const id = (options.use_created_id ? person.id : options.test_id)
                    deletePerson(id, (error, response) => {
                        done(error, id)
                    })
                } else {
                    done(error)
                }
            })
        }


        it('should not return an error when the id is valid', function(done) {
            testDelete({use_created_id: true}, (error, id) => {
                expect(error).to.not.exist
                done()
            })
        })


        it('should not be able to read after delete', function(done) {
            testDelete({use_created_id: true}, (error, id) => {
                expect(error).to.not.exist
                readPerson(id, (error, response) => {
                    expect(response).to.not.exist
                    expect(error.message).to.equal('id is invalid')
                    done()
                })
            })
        })


        it('should return an error when the request is missing the id', function(done) {
            testDelete({test_id: undefined}, (error, id) => {
                expect(error.message).to.equal('id is invalid')
                done()
            })
        })


        it('should return an error when the id doesnt reference a Person', function(done) {
            const query_id = 'not-a-likely-id'
            testDelete({test_id: query_id}, (error, id) => {
                expect(error.message).to.equal('id is invalid')
                done()
            })
        })

    })

})

