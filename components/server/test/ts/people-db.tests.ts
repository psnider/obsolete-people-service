import CHAI                 = require('chai')
const  expect               = CHAI.expect

import configure            = require('configure-local')
import db                   = require('../../src/ts/people-db')
import test_support         = require('../../src/ts/test-support')


type PersonCallback = (error: Error, results?: any) => void



let next_mobile_number = 1234

// This is identical to newPerson() in people-db.tests.ts
function newPerson(options?: {id?: string, name?: Person.Name}) : Person.Person {
    const name = (options && options.name) ? options.name : {given: 'Bob', family: 'Smith'}
    const account_email = `${name.given}.${name.family}@test.co`
    const mobile_number = `555-${("000" + next_mobile_number++).slice(-4)}`
    let person : Person.Person = {
        account_email,
        account_status:    'invitee',
        //role:              'user',
        name,
        locale:            'en_US',
        time_zone:         'America/Los_Angeles',
        contact_methods:   [{method: 'mobile', address: mobile_number}]
    }
    if (options && options.id) person.id = options.id
    return person
}


function createPerson(person: Person.Person, done: PersonCallback) : void {
    db.create('Person', person, done)
}


function readPerson(id: string, done: PersonCallback) : void {
    db.read(id, done)
}


function updatePerson(person: Person.Person, done: PersonCallback) : void {
    db.update(person, done)
}


function deletePerson(id: string, done: (error?: Error) => void) : void {
    db.del(id, done)
}


function searchPeople(query: DatabaseIF.ObjectQuery, done: DatabaseIF.SearchCallback) : void {
    db.search(query, done)
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
            const PERSON = newPerson({id: '1'})
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
                    person.contact_methods.push({method: 'twitter', address: 'bobsmith1'})
                },
                (error, updated_person) => {
                    expect(updated_person.contact_methods).to.have.lengthOf(2)
                    expect(updated_person.contact_methods).to.contain({method: 'twitter', address: 'bobsmith1'})
                    done()
                }
            )
        })


        // same as above test, but id is unset
        it('should return an error when the request is missing the id', function(done) {
            testUpdate(
                (person: Person.Person) => {
                    person.id = undefined
                    person.contact_methods.push({method: 'twitter', address: 'bobsmith2'})
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
                    person.contact_methods.push({method: 'twitter', address: 'bobsmith3'})
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
                    person.contact_methods.push({method: 'twitter', address: 'bobsmith4'})
                },
                (error, updated_person) => {
                    readPerson(updated_person.id, (error, read_person) => {
                        if (!error) {
                            expect(updated_person.contact_methods).to.have.lengthOf(2)
                            expect(updated_person.contact_methods).to.contain({method: 'twitter', address: 'bobsmith4'})
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


    describe('search', function() {

        const TEST_NAMES = [
            {given: 'Aaron', family: 'Aardvark'},
            {given: 'Betsy', family: 'Badger'},
            {given: 'Clair', family: 'Caiman'},
            {given: 'Donny',  family: 'Dragon'},
            {given: 'Elaine', family: 'Elephant'},
            {given: 'Frank', family: 'Fox'},
            {given: 'Gertrude', family: 'Gibbon'},
            {given: 'Harry', family: 'Hawk'},
            {given: 'Iris', family: 'Iguana'},
            {given: 'Jan', family: 'Jaguar'},
            {given: 'Kim', family: 'Koala'},
            {given: 'Lou', family: 'Leopard'},
            {given: 'Mary', family: 'Mamba'},
        ]


        before((done) => {
            let call_done_after_n = test_support.call_done_after_n_calls(TEST_NAMES.length, done)
            for (let name of TEST_NAMES) {
                createPerson(newPerson({name}), call_done_after_n)
            }
        })


        describe('ObjectQuery.start_index', function() {

            it('should return the first item when start_index = 0', function(done) {
                searchPeople({start_index: 0}, (error, list: Person.Person[]) => {
                    expect(error).to.not.exist
                    expect(list[0].name).to.exist  // cannot know which person will be first
                    done()
                })
            })


            it('should default start_index to 0', function(done) {
                searchPeople({}, (error, list: Person.Person[]) => {
                    expect(error).to.not.exist
                    expect(list[0].name).to.exist  // cannot know which person will be first
                    done()
                })
            })


            it('should return the tenth item when start_index = 9', function(done) {
                searchPeople({start_index: 0}, (error, list: Person.Person[]) => {
                    expect(list[0].name).to.exist
                    let person_0 = list[0]
                    searchPeople({start_index: 9}, (error, list: Person.Person[]) => {
                        expect(error).to.not.exist
                        expect(list[0].name).to.exist
                        expect(list[0].id).to.not.equal(person_0.id)
                        done()
                    })
                })
            })

        })


        describe('ObjectQuery.count', function() {

            it('should return one item if count = 1', function(done) {
                searchPeople({count: 1}, (error, list: Person.Person[]) => {
                    expect(error).to.not.exist
                    expect(list).to.have.lengthOf(1)
                    done()
                })
            })


            it('should default count to 10', function(done) {
                searchPeople({}, (error, list: Person.Person[]) => {
                    expect(error).to.not.exist
                    expect(list).to.have.lengthOf(10)
                    done()
                })
            })


            it('should return 11 items if count = 11', function(done) {
                searchPeople({start_index: 0, count: 11}, (error, list: Person.Person[]) => {
                    expect(error).to.not.exist
                    expect(list).to.have.lengthOf(11)
                    done()
                })
            })

        })

    })

})
