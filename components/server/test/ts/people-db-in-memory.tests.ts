import CHAI                 = require('chai')
const  expect               = CHAI.expect

import {ArrayCallback, Conditions, Cursor, DatabaseID, DocumentDatabase, ErrorOnlyCallback, Fields, ObjectCallback, Sort, UpdateFieldCommand} from 'document-database-if'
import {Fieldnames, test_create, test_read, test_replace, test_del, test_update, test_find} from 'document-database-tests'

// select either: people-db-mongo or people-db-in-memory
import {InMemoryDB} from '../../src/ts/people-db-in-memory'
import test_support         = require('../../src/ts/test-support')
import PERSON = require('Person')
type Person = PERSON.Person


var db: DocumentDatabase<Person> = new InMemoryDB('people', 'Person')





let next_email_id = 1
let next_mobile_number = 1234

// This is identical to newPerson() in people-db.tests.ts
function newPerson(options?: {_id?: string, name?: Person.Name}) : Person {
    const name = (options && options.name) ? options.name : {given: 'Bob', family: 'Smith'}
    const account_email = `${name.given}.${name.family}.${next_email_id++}@test.co`
    const mobile_number = `555-${("000" + next_mobile_number++).slice(-4)}`
    let person : Person = {
        account_email,
        account_status:    'invitee',
        //role:              'user',
        name,
        locale:            'en_US',
        time_zone:         'America/Los_Angeles',
        contact_methods:   [{method: 'mobile', address: mobile_number}]
    }
    if (options && options._id) person._id = options._id
    return person
}





// NOTE: these tests are identical to the ones in people-service.tests.ts
describe('InMemoryDB', function() {

    function getDB() {return db}

    describe('create()', function() {
         test_create<Person>(getDB, newPerson, ['account_email', 'locale'])        
    })


    describe('read()', function() {
         test_read<Person>(getDB, newPerson, ['account_email', 'locale'])        
    })


    describe('replace()', function() {
         test_replace<Person>(getDB, newPerson, ['account_email', 'locale'])        
    })



    describe('update()', function() {
        var fieldnames: Fieldnames = {
            top_level: {
                populated_string: 'name',
                unpopulated_string: 'description',
                string_array: {name: 'notes'},
                obj_array: {
                    name: 'components',
                    key_field: 'part_id',
                    populated_field: {name: 'info.quantity', type: 'number'},
                    unpopulated_field: {name: 'info.color', type: 'string'},
                    createElement: undefined
                }
            },
            supported: {
                update: {
                    basic_set_only: true
                }
            }
        }

        test_update<Person>(getDB, newPerson, fieldnames)
    })


    describe('del()', function() {
         test_del<Person>(getDB, newPerson, ['account_email', 'locale'])        
    })


    describe('find()', function() {
         test_find<Person>(getDB, newPerson, 'account_email')
    })


/*
   

    describe('replace', function() {

        it('should replace an existing Person', function(done) {
            const PERSON = newPerson()
            createPerson(PERSON, (error, created_person) => {
                if (!error) {
                    created_person.account_email = 'snoopy50@test.co'
                    replacePerson(created_person, (error, replaced_person) => {
                        expect(replaced_person).to.not.equal(created_person)
                        expect(replaced_person.account_email).to.equal('snoopy50@test.co')
                        done(error)
                    })
                } else {
                    done(error)
                }
            })
        })

    })


    describe('update', function() {

        function testUpdate(options: {use_created_id?: boolean, test_id?: string}, update: UpdateFieldCommand, done: ObjectCallback<Person>) {
            const PERSON = newPerson()
            createPerson(PERSON, (error, created_person) => {
                expect(error).to.not.exist
                const _id = (options.use_created_id ? created_person._id : options.test_id)
                updatePerson(_id, [update], (error, updated_person) => {
                    done(error, updated_person)
                })
            })
        }


        it('should update a Person when the _id is valid', function(done) {
            testUpdate({use_created_id: true},
                {cmd: 'set', field: 'account_email', value: 'bubba.smith@test.co'},
                (error, updated_person) => {
                    expect(updated_person.account_email).to.equal('bubba.smith@test.co')
                    done()
                }
            )
        })


        // same as above test, but _id is unset
        it('should return an error when the request is missing the _id', function(done) {
            testUpdate({test_id: undefined},
                {cmd: 'set', field: 'account_email', value: 'bubba.smith@test.co'},
                (error, updated_person) => {
                    expect(error.message).to.equal('_id is invalid')
                    done()
                }
            )
        })


        it('should return an error when the _id doesnt reference a Person', function(done) {
            testUpdate({test_id: 'ffffffffffffffffffffffff'},
                {cmd: 'set', field: 'account_email', value: 'bubba.smith@test.co'},
                (error, updated_person) => {
                    expect(error.message).to.deep.equal('_id is invalid')
                    done()
                }
            )
        })


        it('subsequent read should get the update', function(done) {
            const email = 'bubba.smith.10@test.co'
            testUpdate({use_created_id: true},
                {cmd: 'set', field: 'account_email', value: email},
                (error, updated_person) => {
                    readPerson(updated_person._id, (error, read_person) => {
                        if (!error) {
                            expect(read_person.account_email).to.equal(email)
                        }
                        done(error)
                    })
                }
            )
        })

    })


    describe('delete', function() {

        function testDelete(options: {use_created_id?: boolean, test_id?: string}, done: (error: Error, _id?: string) => void) {
            const PERSON = newPerson()
            createPerson(PERSON, (error, created_person) => {
                expect(error).to.not.exist
                const _id = (options.use_created_id ? created_person._id : options.test_id)
                deletePerson(_id, (error) => {
                    done(error, _id)
                })
            })
        }


        it('should not return an error when the _id is valid', function(done) {
            testDelete({use_created_id: true}, (error, _id) => {
                expect(error).to.not.exist
                done()
            })
        })


        it('should not be able to read after delete', function(done) {
            testDelete({use_created_id: true}, (error, _id) => {
                expect(error).to.not.exist
                readPerson(_id, (error, response) => {
                    expect(response).to.not.exist
                    expect(error.message).to.equal('_id is invalid')
                    done()
                })
            })
        })


        it('should return an error when the request is missing the _id', function(done) {
            testDelete({test_id: undefined}, (error, _id) => {
                expect(error.message).to.equal('_id is invalid')
                done()
            })
        })


        it('should return an error when the _id doesnt reference a Person', function(done) {
            const query_id = 'not-a-likely-_id'
            testDelete({test_id: query_id}, (error, _id) => {
                expect(error.message).to.equal('_id is invalid')
                done()
            })
        })

    })


    describe('find', function() {

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
            // start with a new database
            db = new InMemoryDB('people-test-find', 'Person')
            // then add the test data
            let call_done_after_n = test_support.call_done_after_n_calls(TEST_NAMES.length, done)
            for (let name of TEST_NAMES) {
                createPerson(newPerson({name}), call_done_after_n)
            }
        })


        describe('with sort ascending on name.given', function() {

            describe('cursor', function() {

                it('should return the first item when start_offset = 0', function(done) {
                    findPeople(undefined, undefined, {'name.given': 1}, {start_offset: 0}, (error, list: Person[]) => {
                        expect(error).to.not.exist
                        expect(list[0].name.given).to.equal('Aaron')
                        done()
                    })
                })


                it('should default start_offset to 0', function(done) {
                    findPeople(undefined, undefined,  {'name.given': 1}, undefined, (error, list: Person[]) => {
                        expect(error).to.not.exist
                        expect(list[0].name.given).to.equal('Aaron')
                        done()
                    })
                })


                it('should return the tenth item when start_offset = 9', function(done) {
                    findPeople(undefined, undefined, {'name.given': 1}, {start_offset: 9}, (error, list: Person[]) => {
                        expect(error).to.not.exist
                        expect(list[0].name.given).to.equal('Jan')
                        done()
                    })
                })


                it('should return one item if count = 1', function(done) {
                    findPeople(undefined, undefined, {'name.given': 1}, {count: 1}, (error, list: Person[]) => {
                        expect(error).to.not.exist
                        expect(list).to.have.lengthOf(1)
                        done()
                    })
                })


                it('should default count to 10', function(done) {
                    findPeople(undefined, undefined, {'name.given': 1}, undefined, (error, list: Person[]) => {
                        expect(error).to.not.exist
                        expect(list).to.have.lengthOf(10)
                        done()
                    })
                })


                it('should return 11 items if count = 11', function(done) {
                    findPeople(undefined, undefined, {'name.given': 1}, {count: 11}, (error, list: Person[]) => {
                        expect(error).to.not.exist
                        expect(list).to.have.lengthOf(11)
                        done()
                    })
                })

            })

        })

    })
*/
})
