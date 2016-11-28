import request                          = require('request')
import chai                             = require('chai')
var expect                              = chai.expect

import configure = require('@sabbatical/configure-local')
import {MicroServiceConfig} from '@sabbatical/generic-data-server'
import {DocumentDatabase, Request as DBRequest, Response as DBResponse} from '@sabbatical/document-database'
import {Person, Name, ContactMethod} from '../../../../local-typings/people-service/shared/person'

const config = <MicroServiceConfig>configure.get('people')
const API_URL = config.api_url




describe('people API', function() {

    function createPerson(person: Person, done: (error: Error, response?: DBResponse) => void)  {
        var data : DBRequest = {action: 'create', obj: person}
        var options = {
          uri: API_URL,
          method: 'POST',
          json: data
        }
        request.post(options, function(error, response, body: DBResponse) {
            if (error) {
                done(error)
            } else {
                if (response.statusCode == 200) {
                    let created_person = <Person>body.data
                    expect(created_person._id).to.exist
                    done(null, body)
                }
                else {
                    done(new Error('response.statusCode=' + response.statusCode))
                }
            }
        })
    }



    function readPerson(_id: string, done: (error: Error, response?: DBResponse) => void)  {
        var data : DBRequest = {action: 'read', obj: {_id}}
        var options = {
          uri: API_URL,
          method: 'POST',
          json: data
        }
        request.post(options, function(error, response, body) {
            if (error) {
                done(error)
            } else {
                if (response.statusCode == 200) {
                    let read_person = <Person>body.data
                    expect(read_person._id).to.equal(_id)
                    done(null, body)
                }
                else {
                    done(new Error('response.statusCode=' + response.statusCode))
                }
            }
        })
    }



    function updatePerson(person: Person, done: (error: Error, response?: DBResponse) => void)  {
        var _id = person._id;
        var data : DBRequest = {action: 'update', obj: person}
        var options = {
          uri: API_URL,
          method: 'POST',
          json: data
        }
        request.post(options, function(error, response, body) {
            if (error) {
                done(error)
            } else {
                if (response.statusCode == 200) {
                    let updated_person = <Person>body.data
                    expect(updated_person._id).to.equal(_id)
                    done(null, body)
                }
                else {
                    done(new Error('response.statusCode=' + response.statusCode))
                }
            }
        })
    }


    function deletePerson(_id: string, done: (error: Error, response?: DBResponse) => void)  {
        var data : DBRequest = {action: 'delete', obj: {_id}}
        var options = {
          uri: API_URL,
          method: 'POST',
          json: data
        }
        request.post(options, function(error, response, body) {
            if (error) {
                done(error)
            } else {
                if (response.statusCode == 200) {
                    done(null, body)
                }
                else {
                    done(new Error('response.statusCode=' + response.statusCode))
                }
            }
        })
    }


    describe('action:create', function() {

        it('should create a new Person', function(done) {
            const PERSON = {name: {given: 'Sally', family: 'Smith'}}
            createPerson(PERSON, (error, response) => {
                if (!error) {
                    expect(response).to.not.have.property('error')
                    let person = <Person>response.data
                    expect(person).to.not.equal(PERSON)
                    expect(person).to.have.property('_id')
                    expect(PERSON).to.not.have.property('_id')
                    expect(person.name).to.deep.equal(PERSON.name)
                }
                done(error)
            })
        })

    })


    describe('action:read', function() {

        it('should read a Person when the _id is valid', function(done) {
            const PERSON = {name: {given: 'Rich', family: 'Rogers'}}
            createPerson(PERSON, (error, response) => {
                if (!error) {
                    var created_person = <Person>response.data
                    readPerson(created_person._id, (error, response) => {
                        if (!error) {
                            expect(response).to.not.have.property('error')
                            let read_person = <Person>response.data
                            expect(read_person).to.not.equal(PERSON)
                            expect(read_person).to.not.equal(created_person)
                            expect(read_person._id).to.equal(created_person._id)
                            expect(read_person.name).to.deep.equal(PERSON.name)
                        }
                        done(error)
                    })
                } else {
                    done(error)
                }
            })
        })

    })


    describe('action:update', function() {

        it('should update a Person when the _id is valid', function(done) {
            const PERSON = {name: {given: 'Al', family: 'Adams'}}
            createPerson(PERSON, (error, response) => {
                if (!error) {
                    var created_person = <Person>response.data
                    const UPDATED_PERSON = {_id: created_person._id, name: {given: 'Al', family: 'Adamson'}}
                    updatePerson(UPDATED_PERSON, (error, response) => {
                        if (!error) {
                            expect(response).to.not.have.property('error')
                            let updated_person = <Person>response.data
                            expect(updated_person).to.not.equal(created_person)
                            expect(updated_person._id).to.equal(created_person._id)
                            expect(updated_person.name).to.deep.equal(UPDATED_PERSON.name)
                        }
                        done(error)
                    })
                } else {
                    done(error)
                }
            })
        })

    })


    describe('action:delete', function() {

        it('should delete a Person when the _id is valid', function(done) {
            const PERSON = {name: {given: 'Cal', family: 'Cool'}}
            createPerson(PERSON, (error, response) => {
                if (!error) {
                    var created_person = <Person>response.data
                    deletePerson(created_person._id, (error, response) => {
                        if (!error) {
                            expect(response).to.not.have.property('error')
                            let deleted_person = <Person>response.data
                            expect(deleted_person).to.not.exist
                        }
                        done(error)
                    })
                } else {
                    done(error)
                }
            })
        })

    })

})
