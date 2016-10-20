import CHAI                 = require('chai')
const  expect               = CHAI.expect

import configure            = require('configure-local')
import Database = require('document-database-if')
import {Person, Name, ContactMethod} from '../../../../typings/people-service/shared/person'
import test_support         = require('../../src/ts/test-support')
// select either: people-db-mongo or people-db-in-memory
import {InMemoryDB} from '../../src/ts/people-db-in-memory'
var db: Database.DocumentDatabase<Person> = new InMemoryDB('people', 'Person')



describe('test-support', function() {

    before(function(done) {
        db.connect((error) => {
            if (!error) {
                test_support.seedTestDatabase(db).then((results) => {
                    done()
                }, (error) => {
                    console.log(`error=${error}`)
                    done(error)
                })
            } else {
                done(error)
            }
        })
    })


    after(function(done) {
        db.disconnect((error) => {
            done(error)
        })
    })


    it('should return a Person when the _id is valid', function(done) {
        db.find(undefined, undefined, {'name.given': 1}, {count: 1000}, (error, list: Person[]) => {
            if (!error) {
                expect(list).to.have.lengthOf(18)
                list.forEach(function(person: Person) {
                    expect(person.name).to.exist
                })
            }
            done(error)
        })
    })


})
