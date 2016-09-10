// import mongoose = require('mongoose')
// mongoose.Promise = Promise;
import pino = require('pino');
import HTTP_STATUS = require('http-status-codes');


import configure = require('configure-local');
import PERSON = require('Person')
type Person = PERSON.Person

var next_id = 1;
function getNextId(): string {return (next_id++).toString()}
var people: Person[] = []
var index: {[id:string]: Person} = {}

var log = pino({name: 'people-db', enabled: !process.env.DISABLE_LOGGING})


function cloneObject(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    var temp = obj.constructor(); // give temp the original obj's constructor
    for (var key in obj) {
        temp[key] = cloneObject(obj[key]);
    }
    return temp;
}


function cloneFromIndex(id) {
    var person = index[id]
    return cloneObject(person)
}


function newError(msg, status) {
    let error = new Error(msg)
    error['http_status'] = status
    return error
}


function create(typename: string, value: {}, done: DatabaseIF.CreateCallback): void {
    if (value['id'] == null) {
        var person = cloneObject(value)
        person.id = getNextId()
        people.push(person)
        index[person.id] = person
        done(undefined, person)
    } else {
        var error = newError('id isnt allowed for create', HTTP_STATUS.BAD_REQUEST)
        done(error)

    }
}


function read(id: DatabaseIF.DatabaseID, done: DatabaseIF.ReadSingleCallback): void {
    var person = cloneFromIndex(id)
    if (person) {
        done(undefined, person)
    } else {
        done(newError(`id is invalid`, HTTP_STATUS.BAD_REQUEST))
    }
}


function update(value: {id: DatabaseIF.DatabaseID}, done: DatabaseIF.UpdateSingleCallback): void {
    debugger
    var person = index[value.id]
    if (person) {
        person = Object.assign(person, value)
        index[value.id] = person
        done(undefined, cloneFromIndex(value.id))
    } else {
        done(newError(`id is invalid`, HTTP_STATUS.BAD_REQUEST))
    }
}


function del(id: DatabaseIF.DatabaseID, done: DatabaseIF.DeleteSingleCallback): void {
    var person = index[id]
    if (person) {
        delete index[id]
        done()
    } else {
        done(newError(`id is invalid`, HTTP_STATUS.BAD_REQUEST))
    }
}


function search(query: DatabaseIF.ObjectQuery, done: DatabaseIF.SearchCallback): void {
    let start = (query && query.start_index) ? query.start_index : 0
    let count = (query && query.count) ? query.count : 10
    let results = people.slice(start, start + count)
    done(undefined, results)
}


function reset(): void {
    people = []
    index = {}
}

var db: DatabaseIF.Database = {
    create,
    read,
    update,
    del,
    search,
    test: {
        reset
    }
}


export = db
