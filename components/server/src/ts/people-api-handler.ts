import bodyParser = require('body-parser');
import * as express from "express-serve-static-core";
import fs = require('fs');
import HTTP_STATUS = require('http-status-codes');
import pino = require('pino');
import REQUEST = require('request');

import configure = require('configure-local');
import Database = require('document-database-if')
import PERSON = require('Person')
type Person = PERSON.Person

import db = require('./people-db')


var log = pino({name: 'people-handler', enabled: !process.env.DISABLE_LOGGING})


//=====================================================================================

// IMPLEMENTATION NOTE: typescript doesn't allow the use of the keyword delete as a function name
const VALID_ACTIONS = {create, read, replace, update, delete: del, find}



function create(msg: Database.Request<Person.Person>, done) {
    db.create(msg.obj, done)
}


function read(msg: Database.Request<Person.Person>, done) {
    let _id = msg.query && msg.query.ids && msg.query.ids[0]
    db.read(_id, done)
}


function replace(msg: Database.Request<Person.Person>, done) {
    db.replace(msg.obj, done)
}


function update(msg: Database.Request<Person.Person>, done) {
    db.update(msg.query && msg.query.conditions, msg.updates, done)
}


function del(msg: Database.Request<Person.Person>, done) {
    let _id = msg.query && (msg.query.ids && msg.query.ids[0])
    db.del(_id, done)
}


function find(msg: Database.Request<Person.Person>, done) {
    db.find(msg.query && msg.query.conditions, msg.query && msg.query.fields, msg.query && msg.query.sort, msg.query && msg.query.cursor, done)
}


function handlePeople(req, res) {
    const fname = 'handlePeople'
    const msg: Database.Request<Person.Person> = req.body
    if (msg) {
        // restrict the space of user input actions to those that are public
        var action = VALID_ACTIONS[msg.action];
        if (action) {
            action(msg, (error, db_response: Person.Person | Person.Person[]) => {
                let response: Database.Response<Person.Person>
                if (!error) {
                    // TODO: must set response.total_count for find()
                    response = {
                        data: db_response
                    }
                    log.info({fname, action: msg.action, status: 'ok'})
                    res.send(response)             
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
                        response = {error: {message: error.message, stack: error.stack}}
                        res.send(response)
                    } else {
                        res.sendStatus(status)                        
                    }
                }
            })
        } else {
            // TODO: consider generating a GUID to present to the user for reporting
            log.warn({fname, action: msg.action, msg: 'msg.action is invalid')
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
