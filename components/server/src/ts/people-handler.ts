import fs = require('fs');
import configure = require('configure-local');
import HTTP_STATUS = require('http-status-codes');

import pino = require('pino');
import REQUEST = require('request');

import bodyParser = require('body-parser');
import * as express from "express-serve-static-core";


import db = require('./people-db')




var log = pino({name: 'people-handler', enabled: !process.env.DISABLE_LOGGING})



//=====================================================================================
// common code

function idHasCorrectForm(msg : PeopleProtocol.Request) {
    if (('person' in msg) && ('id' in msg.person)) {
        let id = msg.person['id']
        return (typeof id === 'string') && (id.length > 0)
    } else {
        return false
    }
}



//=====================================================================================

// IMPLEMENTATION NOTE: typescript doesn't allow the use of the keyword delete as a function name
const VALID_ACTIONS = {create, read, update, delete: del}



function create(msg, done) {
    db.create('Person', msg.person, done)
}


function read(msg, done) {
    db.read(msg.person.id, done)
}


function update(msg, done) {
    db.update(msg.person, done)
}


function del(msg: PeopleProtocol.Request, done) {
    db.del(msg.person.id, done)
}


function handlePeople(req, res) {
    const fname = 'handlePeople'
    const msg: PeopleProtocol.Request = req.body
    if (msg) {
        // restrict the space of user input actions to those that are public
        var action = VALID_ACTIONS[msg.action];
        if (action) {
            action(msg, (error, response) => {
                if (!error) {
                    // let reply: PeopleProtocol.Response = {}
                    // if (response) {
                    //     reply.person = response
                    // }
                    res.send({person: response})             
                } else {
                    let status
                    // TODO: consider generating a GUID to present to the user for reporting
                    if (error.http_status) {
                        status = error.http_status
                        log.warn({fname, action: msg.action, msg: `${msg.action} failed`})
                    } else {
                        status = HTTP_STATUS.INTERNAL_SERVER_ERROR
                        log.error({fname, action: msg.action, msg: `${msg.action} error didnt include error.http_status`}) 
                    }
                    if (process.env.NODE_ENV === 'development') {
                        res.status(status)
                        res.send({error: {message: error.message, stack: error.stack}})
                    } else {
                        res.sendStatus(status)                        
                    }
                }
            })
        } else {
            // TODO: consider generating a GUID to present to the user for reporting
            res.sendStatus(HTTP_STATUS.BAD_REQUEST);
            log.warn({fname, action: msg.action})
        }
    } else {
        res.sendStatus(400)
    }
}

//=====================================================================================

export function configureExpress(app: express.Express) {
    const limit = configure.get('people:body-parser-limit')
    let jsonParser = bodyParser.json({limit})
    app.use(bodyParser.json({limit}))
    app.post('/api/people', jsonParser, handlePeople)    
}
