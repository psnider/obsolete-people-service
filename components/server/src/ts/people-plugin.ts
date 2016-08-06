import * as fs from 'fs'
import * as SENECA from 'seneca'
import * as PeoplePlugin from 'people-plugin'



function people(options: PeoplePlugin.Options) {

    this.add('init:people', init)


    function init(msg, done) {
        done()
    }


    function idHasCorrectForm(msg : PeopleProtocol.Request) {
        if (('person' in msg) && ('id' in msg.person)) {
            let id = msg.person['id']
            return (typeof id === 'string') && (id.length > 0)
        } else {
            return false
        }
    }


    // These actions are done before these calls
    // - validate against schema
    // - authorize


    this.add('role:people,action:create', function(msg : PeopleProtocol.Request, done) {
        let person = msg.person
        if ('id' in person) {
            let response : PeopleProtocol.Response = {error: new Error('person.id isnt allowed for create')}
            done(null, response)
        } else {
            this.make('person').save$(person, function(error, created_person) {
                if (error) {
                    done(error)
                } else {
                    let response : PeopleProtocol.Response = {person: created_person}
                    done(null, response)
                }
            })
        }
    })


    this.add('role:people,action:read', function(msg : PeopleProtocol.Request, done) {
        if (!idHasCorrectForm(msg)) {
            let response : PeopleProtocol.Response = {error: new Error('person.id was not set or is invalid')}
            done(null, response)
        } else {
            let id = msg.person['id']
            this.make('person').load$(id, function(error, read_person) {
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

    this.add('role:people,action:update', function(msg : PeopleProtocol.Request, done) {
        if (!idHasCorrectForm(msg)) {
            let response : PeopleProtocol.Response = {error: new Error('person.id was not set or is invalid')}
            done(null, response)
        } else {
            let id = msg.person['id']
            let person = this.make('person').load$(id, function(error, read_person) {
                if (error) {
                    done(error)
                } else {
                    var response : PeopleProtocol.Response
                    if (read_person == null) {
                        response = {error: new Error('no person for id=' + id)}
                        done(null, response)
                    } else {
                        person.save$(msg.person, function(error, updated_person) {
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


    this.add('role:people,action:delete', function(msg : PeopleProtocol.Request, done) {
        if (!idHasCorrectForm(msg)) {
            let response : PeopleProtocol.Response = {error: new Error('person.id was not set or is invalid')}
            done(null, response)
         } else {
             let id = msg.person['id']
            this.make('person').remove$(id, function(error) {
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
