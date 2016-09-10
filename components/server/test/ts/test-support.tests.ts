import CHAI                 = require('chai')
const  expect               = CHAI.expect

import configure            = require('configure-local')
import test_support         = require('../../src/ts/test-support')
import db                   = require('../../src/ts/people-db')




describe('test-support', function() {

    before(function(done) {
        db.test.reset()
        test_support.seedTestDatabase().then((results) => {
            done()
        }, (error) => {
            console.log(`error=${error}`)
            done(error)
        })
    })


    it('should return a Person when the id is valid', function(done) {
        db.search({count: 1000}, (error, list) => {
            if (!error) {
                expect(list).to.have.lengthOf(18)
                list.forEach(function(person: Person.Person) {
                    expect(person.name).to.exist
                })
            }
            done(error)
        })
    })


})
