import CHAI                 = require('chai')
const  expect               = CHAI.expect
import SENECA               = require('seneca')

import configure            = require('configure-local')
var    people_plugin        = require('people-plugin')
import test_support         = require('test-support')




describe('test-support', function() {

    var seneca : SENECA.Instance


    function list(query, done: (error: Error, list: any[]) => void) {
        var entity = seneca.make('person')
        entity.list$(query, function(error, list) {
            done(error, list)
        })
    }


    function deleteAll(done: (error: Error) => void) {
        var done_called = false
        function doneOnce(error?) {
            if (!done_called) {
                done(error)
                done_called = true
            }
        }
        var entity = seneca.make('person')
        entity.list$({}, function(error, list) {
            if (!error) {
                list.forEach((person) => {
                    entity.remove$( person.id, (error) => {
                        if (error) {
                            doneOnce(error)
                        }
                    })
                })
            }
            doneOnce(error)
        })
    }


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
        deleteAll((error) => {
            if (!error) {
                test_support.seedTestDatabase(seneca).then((results) => {
                    doneOnce()
                }, (error) => {
                    console.log(`error=${error}`)
                    doneOnce(error)
                })
            } else {
                doneOnce(error)
            }
        })
    })


    it('should return a Person when the id is valid', function(done) {
        list({}, (error, list) => {
            if (!error) {
                expect(list).to.have.lengthOf(18)
                list.forEach(function(person) {
                    expect(person.name).to.exist
                    expect(person.name).to.exist
                })
            }
            done(error)
        })
    })


})
