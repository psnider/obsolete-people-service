import request                          = require('request')
import chai                             = require('chai')
var expect                              = chai.expect

import configure = require('configure-local')
import Database = require('document-database-if')
import PERSON = require('Person')
type Person = PERSON.Person

const SERVICE_URL = configure.get('people:service-url')





describe('people API', function() {

    function createPerson(person: Person, done: (error: Error, response?: Database.Response<Person>) => void)  {
        var data : Database.Request<Person> = {action: 'create', obj: person}
        var options = {
          uri: SERVICE_URL,
          method: 'POST',
          json: data
        }
        request.post(options, function(error, response, body: Database.Response<Person>) {
            if (error) {
                done(error)
            } else {
                if (response.statusCode == 200) {
                    let created_person = <Person>body.data
                    expect(created_person.id).to.exist
                    done(null, body)
                }
                else {
                    done(new Error('response.statusCode=' + response.statusCode))
                }
            }
        })
    }



    function readPerson(id: string, done: (error: Error, response?: Database.Response<Person>) => void)  {
        var data : Database.Request<Person> = {action: 'read', obj: {id: id}}
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
                    let read_person = <Person>body.data
                    expect(read_person.id).to.equal(id)
                    done(null, body)
                }
                else {
                    done(new Error('response.statusCode=' + response.statusCode))
                }
            }
        })
    }



    function updatePerson(person: Person, done: (error: Error, response?: Database.Response<Person>) => void)  {
        var id = person.id;
        var data : Database.Request<Person> = {action: 'update', obj: person}
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
                    let updated_person = <Person>body.data
                    expect(updated_person.id).to.equal(id)
                    done(null, body)
                }
                else {
                    done(new Error('response.statusCode=' + response.statusCode))
                }
            }
        })
    }


    function deletePerson(id: string, done: (error: Error, response?: Database.Response<Person>) => void)  {
        var data : Database.Request<Person> = {action: 'delete', obj: {id: id}}
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
                    let person = <Person>response.data
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
                    var created_person = <Person>response.data
                    readPerson(created_person.id, (error, response) => {
                        if (!error) {
                            expect(response).to.not.have.property('error')
                            let read_person = <Person>response.data
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
                    var created_person = <Person>response.data
                    const UPDATED_PERSON = {id: created_person.id, name: {given: 'Al', family: 'Adamson'}}
                    updatePerson(UPDATED_PERSON, (error, response) => {
                        if (!error) {
                            expect(response).to.not.have.property('error')
                            let updated_person = <Person>response.data
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
                    var created_person = <Person>response.data
                    deletePerson(created_person.id, (error, response) => {
                        if (!error) {
                            expect(response).to.not.have.property('error')
                            let deleted_person = response<Person>response.data
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
