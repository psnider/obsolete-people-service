import CHAI                 = require('chai')
const  expect               = CHAI.expect

import configure            = require('configure-local')
import db                   = require('../../src/ts/people-db')


type PersonCallback = (error: Error, person?: Person.Person) => void



// This is identical to newPerson() in people-service.tests.ts
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


function createPerson(person: Person.Person, done: PersonCallback)  {
    db.create('Person', person, done)
}


function readPerson(id: string, done: PersonCallback)  {
    db.read(id, done)
}


function updatePerson(person: Person.Person, done: PersonCallback)  {
    db.update(person, done)
}


function deletePerson(id: string, done: (error?: Error) => void)  {
    db.del(id, done)
}



// NOTE: these tests are identical to the ones in people-service.tests.ts
describe('people-db', function() {

    describe('create', function() {

        it('should create a new Person', function(done) {
            const PERSON = newPerson()
            createPerson(PERSON, (error, person) => {
                expect(error).to.not.exist
                expect(person).to.not.equal(PERSON)
                expect(person).to.have.property('id')
                expect(person.name).to.deep.equal(PERSON.name)
                done(error)
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
                //expect(error['http_status']).to.equal(400)
                expect(person).to.not.exist
                done()
            })
        })

    })


    describe('read', function() {

        function testRead(options: {use_created_id?: boolean, test_id?: string}, done: (error: Error, id?: string, person?: Person.Person) => void) {
            const PERSON = newPerson()
            createPerson(PERSON, (error, created_person) => {
                if (!error) {
                    const id = (options.use_created_id ? created_person.id : options.test_id)
                    readPerson(id, (error, read_person) => {
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


    describe('update', function() {

        function testUpdate(update: (person: Person.Person) => void, done: PersonCallback) {
            const PERSON = newPerson()
            createPerson(PERSON, (error, created_person) => {
                expect(error).to.not.exist
                update(created_person)
                updatePerson(created_person, (error, updated_person) => {
                    done(error, updated_person)
                })
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
                    readPerson(updated_person.id, (error, read_person) => {
                        if (!error) {
                            expect(read_person.contact_methods).to.deep.equal([{method: 'mobile', address: '(800) bob-smit'}, {method: 'twitter', address: 'bobsmith'}])
                        }
                        done(error)
                    })
                }
            )
        })

    })


    describe('delete', function() {

        function testDelete(options: {use_created_id?: boolean, test_id?: string}, done: (error: Error, id?: string) => void) {
            const PERSON = newPerson()
            createPerson(PERSON, (error, created_person) => {
                expect(error).to.not.exist
                const id = (options.use_created_id ? created_person.id : options.test_id)
                deletePerson(id, (error) => {
                    done(error, id)
                })
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
