/// <reference path='../../../typings/main.d.ts' />



import request                          = require('request')
import chai                             = require('chai')
var expect                              = chai.expect

var configure = require('configure-local')

const SERVICE_URL = configure.get('people:service-url')




describe('people API', function() {

    function createPerson(person: Person.Person, done: (error: Error, response?: PeopleProtocol.Response) => void)  {
        var data : PeopleProtocol.Request = {action: 'create', person: person}
        var options = {
          uri: SERVICE_URL,
          method: 'POST',
          json: data
        }
        request.post(options, function(error, response, body) {
            if (error) {
                done(error)
            } else {
                if (response.statusCode == 200) {
                    expect(body.person.id).to.exist
                    done(null, body)
                }
                else {
                    done(new Error('response.statusCode=' + response.statusCode))
                }
            }
        })
    }



    function readPerson(id: string, done: (error: Error, response?: PeopleProtocol.Response) => void)  {
        var data : PeopleProtocol.Request = {action: 'read', person: {id: id}}
        var options = {
          uri: SERVICE_URL,
          method: 'POST',
          json: data
        }
        request.post(options, function(error, response, body) {
            if (error) {
                done(error)
            } else {
                if (response.statusCode == 200) {
                    expect(body.person.id).to.equal(id)
                    done(null, body)
                }
                else {
                    done(new Error('response.statusCode=' + response.statusCode))
                }
            }
        })
    }



    function updatePerson(person: Person.Person, done: (error: Error, response?: PeopleProtocol.Response) => void)  {
        var id = person.id;
        var data : PeopleProtocol.Request = {action: 'update', person: person}
        var options = {
          uri: SERVICE_URL,
          method: 'POST',
          json: data
        }
        request.post(options, function(error, response, body) {
            if (error) {
                done(error)
            } else {
                if (response.statusCode == 200) {
                    expect(body.person.id).to.equal(id)
                    done(null, body)
                }
                else {
                    done(new Error('response.statusCode=' + response.statusCode))
                }
            }
        })
    }


    function deletePerson(id: string, done: (error: Error, response?: PeopleProtocol.Response) => void)  {
        var data : PeopleProtocol.Request = {action: 'delete', person: {id: id}}
        var options = {
          uri: SERVICE_URL,
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
                    let person = response.person
                    expect(person).to.not.equal(PERSON)
                    expect(person).to.have.property('id')
                    expect(PERSON).to.not.have.property('id')
                    expect(person.name).to.deep.equal(PERSON.name)
                }
                done(error)
            })
        })

    })


    describe('action:read', function() {

        it('should read a Person when the id is valid', function(done) {
            const PERSON = {name: {given: 'Rich', family: 'Rogers'}}
            createPerson(PERSON, (error, response) => {
                if (!error) {
                    var created_person = response.person
                    readPerson(created_person.id, (error, response) => {
                        if (!error) {
                            expect(response).to.not.have.property('error')
                            let read_person = response.person
                            expect(read_person).to.not.equal(PERSON)
                            expect(read_person).to.not.equal(created_person)
                            expect(read_person.id).to.equal(created_person.id)
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

        it('should update a Person when the id is valid', function(done) {
            const PERSON = {name: {given: 'Al', family: 'Adams'}}
            createPerson(PERSON, (error, response) => {
                if (!error) {
                    var created_person = response.person
                    const UPDATED_PERSON = {id: created_person.id, name: {given: 'Al', family: 'Adamson'}}
                    updatePerson(UPDATED_PERSON, (error, response) => {
                        if (!error) {
                            expect(response).to.not.have.property('error')
                            let updated_person = response.person
                            expect(updated_person).to.not.equal(created_person)
                            expect(updated_person.id).to.equal(created_person.id)
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

        it('should delete a Person when the id is valid', function(done) {
            const PERSON = {name: {given: 'Cal', family: 'Cool'}}
            createPerson(PERSON, (error, response) => {
                if (!error) {
                    var created_person = response.person
                    deletePerson(created_person.id, (error, response) => {
                        if (!error) {
                            expect(response).to.not.have.property('error')
                            let deleted_person = response.person
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
