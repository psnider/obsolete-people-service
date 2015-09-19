/// <reference path="../../typings/node/node.d.ts"/>
/// <reference path="../../typings/seneca/seneca.d.ts"/>
/// <reference path="../../typings/people-service/people-plugin.d.ts"/>
/// <reference path="../../typings/people-service/people-protocol.d.ts"/>
// Assume express is using validation of the msg via json-schema

import * as fs from 'fs'
import * as SENECA from 'seneca'
import * as PeoplePlugin from 'people-plugin'



function people( options: PeoplePlugin.Options ) {
    let seneca : SENECA.Seneca = this

    seneca.add('init:people', init )


    function init(msg, done) {
        done()
    }


    function idHasCorrectForm(msg : PeopleProtocol.Request) {
        return (('person' in msg) && ('id' in msg.person) && (msg.person.id != null) && (msg.person.id.length > 0))
    }


    // These actions are done before these calls
    // - validate against schema
    // - authorize


    seneca.add('role:people,action:create', (msg : PeopleProtocol.Request, done) => {
        let person = msg.person
        if ('id' in person) {
            let response : PeopleProtocol.Response = {error: new Error('person.id isnt allowed for create')}
            done(null, response)
        } else {
            this.make('person').save$(person, (error, created_person) => {
                if (error) {
                    done(error)
                } else {
                    let response : PeopleProtocol.Response = {person: created_person}
                    done(null, response)
                }
            })
        }
    })


    seneca.add( 'role:people,action:read', (msg : PeopleProtocol.Request, done) => {
        if (!idHasCorrectForm(msg)) {
            let response : PeopleProtocol.Response = {error: new Error('person.id was not set or is invalid')}
            done(null, response)
        } else {
            let id = msg.person.id
            this.make('person').load$(id, (error, read_person) => {
                if (error) {
                    done(error)
                } else {
                    var response : PeopleProtocol.Response
                    if (read_person == null) {
                        response = {error: new Error('no person for id=' + id)}
                    } else {
                        response = {person: read_person}
                    }
                    done(null, response)
                }
            })
        }
    })

    seneca.add( 'role:people,action:update', (msg : PeopleProtocol.Request, done) => {
        if (!idHasCorrectForm(msg)) {
            let response : PeopleProtocol.Response = {error: new Error('person.id was not set or is invalid')}
            done(null, response)
        } else {
            let id = msg.person.id
            let person = this.make('person').load$(id, (error, read_person) => {
                if (error) {
                    done(error)
                } else {
                    var response : PeopleProtocol.Response
                    if (read_person == null) {
                        response = {error: new Error('no person for id=' + id)}
                        done(null, response)
                    } else {
                        person.save$(msg.person, (error, updated_person) => {
                            if (error) {
                                done(error)
                            } else {
                                response = {person: updated_person}
                                done(null, response)
                            }
                        })
                    }
                }
            })
        }
    })


    seneca.add('role:people,action:delete', (msg : PeopleProtocol.Request, done) => {
        if (!idHasCorrectForm(msg)) {
            let response : PeopleProtocol.Response = {error: new Error('person.id was not set or is invalid')}
            done(null, response)
        } else {
            let id = msg.person.id
            this.make('person').remove$(id, (error) => {
                if (error) {
                    done(error)
                } else {
                    let response : PeopleProtocol.Response = {person: null}
                    done(null, response)
                }
            })
        }
    })

}

export = people
