import CHAI                 = require('chai')
const  expect               = CHAI.expect
import path                 = require('path')
import tmp                  = require('tmp')

import configure            = require('configure-local')
import Database             = require('document-database-if')
import MongodRunner         = require('mongod-runner')
import test_support         = require('../../../src/ts/test-support')
import PERSON               = require('Person')
type Person = PERSON.Person

import {db} from '../../../src/ts/people-db'




let next_mobile_number = 1234

// This is identical to newPerson() in people-db.tests.ts
function newPerson(options?: {_id?: string, name?: Person.Name}) : Person.Person {
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
    if (options && options._id) person._id = options._id
    return person
}


function createPerson(person: Person.Person, done: Database.ObjectCallback<Person>) : void {
    db.create(person, done)
}


function readPerson(_id: string, done: Database.ObjectCallback<Person>) : void {
    db.read(_id, done)
}


function replacePerson(person: Person.Person, done: Database.ObjectCallback<Person>) : void {
    db.replace(person, done)
}


function updatePerson(_id: Database.DatabaseID, updates: Database.UpdateFieldCommand[], done: Database.ObjectCallback<Person>): void {
    db.update({_id: _id}, updates, undefined, done)
}


function deletePerson(_id: string, done: Database.ErrorOnlyCallback) : void {
    db.del(_id, done)
}


function findPeople(conditions : Database.Conditions, fields: Database.Fields, sort: Database.Sort, cursor: Database.Cursor, done: Database.ArrayCallback<Person>) : void {
    db.find(conditions, fields, sort, cursor, done)
}





// NOTE: these tests are identical to the ones in people-service.tests.ts
describe('people-db', function() {

    var DB_NAME = 'people-db-test'
    var PORT = 27016
    var MONGO_PATH = `localhost:${PORT}/${DB_NAME}`

    var spawned_mongod
    var tmp_dir

    before(function(done) {
        process.env['MONGO_PATH'] = MONGO_PATH
        tmp_dir = tmp.dirSync({unsafeCleanup: true})
        var db_path  = path.join(tmp_dir.name, 'data')
        var log_path = path.join(tmp_dir.name, 'log')
        spawned_mongod = MongodRunner.startMongod(PORT.toString(), db_path, log_path, function() {
            db.connect(done)
        })
    })


    after(function(done) {
        db.disconnect((error) => {
            if (error) {
                console.error(`db.disconnect failed: error=${error}`)
            }
            MongodRunner.stopMongod(spawned_mongod, (error) => {
                tmp_dir.removeCallback()
                done(error)
            })
        })
    })


    describe('create', function() {

        it('should create a new Person', function(done) {
            const PERSON = newPerson()
            createPerson(PERSON, (error, person) => {
                expect(error).to.not.exist
                expect(person).to.not.equal(PERSON)
                expect(person).to.have.property('_id')
                expect(person.name).to.deep.equal(PERSON.name)
                done(error)
            })
        })


        it('should not modify the original Person', function(done) {
            const PERSON = newPerson()
            createPerson(PERSON, (error, person) => {
                if (!error) {
                    expect(PERSON).to.not.have.property('_id')
                }
                done(error)
            })
        })


        it('should return an error if the Person contains an ID', function(done) {
            const PERSON = newPerson({_id: '1'})
            createPerson(PERSON, (error, person) => {
                expect(error.message).to.equal('_id isnt allowed for create')
                //expect(error['http_status']).to.equal(400)
                expect(person).to.not.exist
                done()
            })
        })

    })


    describe('read', function() {

        function testRead(options: {use_created_id?: boolean, test_id?: string}, done: (error: Error, _id?: string, person?: Person.Person) => void) {
            const PERSON = newPerson()
            createPerson(PERSON, (error, created_person) => {
                if (!error) {
                    const _id = (options.use_created_id ? created_person._id : options.test_id)
                    readPerson(_id, (error, read_person) => {
                        done(error, _id, read_person)
                    })
                } else {
                    done(error)
                }
            })
        }


        it('should return a Person when the _id is valid', function(done) {
            testRead({use_created_id: true}, (error, _id, person) => {
                if (!error) {
                    expect(person).to.have.property('_id', _id)
                }
                done(error)
            })
        })


        it('should return an error when the request is missing the _id', function(done) {
            testRead({test_id: undefined}, (error, _id, person) => {
                expect(error.message).to.equal('_id is invalid')
                done()
            })
        })


        it('should return an error when the _id doesnt reference a Person', function(done) {
            const query_id = 'not-a-likely-_id'
            testRead({test_id: query_id}, (error, _id, person) => {
                expect(error.message).to.equal('_id is invalid')
                done()
            })
        })

    })


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

        function testUpdate(options: {use_created_id?: boolean, test_id?: string}, update: Database.UpdateFieldCommand, done: Database.ObjectCallback<Person>) {
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
            // add the test data
            let call_done_after_n = test_support.call_done_after_n_calls(TEST_NAMES.length, done)
            for (let name of TEST_NAMES) {
                createPerson(newPerson({name}), call_done_after_n)
            }
        })


        describe('with sort ascending on name.given', function() {

            describe('cursor', function() {

                it('should return the first item when start_offset = 0', function(done) {
                    findPeople(undefined, undefined, {'name.given': 1}, {start_offset: 0}, (error, list: Person.Person[]) => {
                        expect(error).to.not.exist
                        expect(list[0].name.given).to.equal('Aaron')
                        done()
                    })
                })


                it('should default start_offset to 0', function(done) {
                    findPeople(undefined, undefined,  {'name.given': 1}, undefined, (error, list: Person.Person[]) => {
                        expect(error).to.not.exist
                        expect(list[0].name.given).to.equal('Aaron')
                        done()
                    })
                })


                it('should return the tenth item when start_offset = 9', function(done) {
                    findPeople(undefined, undefined, {'name.given': 1}, {start_offset: 9}, (error, list: Person.Person[]) => {
                        expect(error).to.not.exist
                        expect(list[0].name.given).to.equal('Jan')
                        done()
                    })
                })


                it('should return one item if count = 1', function(done) {
                    findPeople(undefined, undefined, {'name.given': 1}, {count: 1}, (error, list: Person.Person[]) => {
                        expect(error).to.not.exist
                        expect(list).to.have.lengthOf(1)
                        done()
                    })
                })


                it('should default count to 10', function(done) {
                    findPeople(undefined, undefined, {'name.given': 1}, undefined, (error, list: Person.Person[]) => {
                        expect(error).to.not.exist
                        expect(list).to.have.lengthOf(10)
                        done()
                    })
                })


                it('should return 11 items if count = 11', function(done) {
                    findPeople(undefined, undefined, {'name.given': 1}, {count: 11}, (error, list: Person.Person[]) => {
                        expect(error).to.not.exist
                        expect(list).to.have.lengthOf(11)
                        done()
                    })
                })

            })

        })

    })

})
