// import mongoose = require('mongoose')
// mongoose.Promise = Promise;
import pino = require('pino');
import HTTP_STATUS = require('http-status-codes');

import configure = require('configure-local');
import Database                         = require('document-database-if')
import {MongoDBAdaptor} from 'mongodb-adaptor'
import {connect as mongoose_connect, disconnect as mongoose_disconnect} from 'mongoose-connector'
import {PersonModel} from './person.mongoose-schema'

import PERSON = require('Person')
type Person = PERSON.Person

var log = pino({name: 'people-db', enabled: !process.env.DISABLE_LOGGING})

var db: MongoDBAdaptor<Person>




function newError(msg, status) {
    let error = new Error(msg)
    error['http_status'] = status
    return error
}


//     const mongodb_path = configure.get('people:mongodb_path')
function connect(mongodb_path: string, done) {
    var onError = (error) => {console.log(`mongoose_connect error=${error}`)}
    mongoose_connect(mongodb_path, onError, (error) => {
        if (!error) {
            db = new MongoDBAdaptor<Person>('person', PersonModel, done)
        } else {
            done(error)
        }
    })
}


function create(typename: string, value: {}, done: Database.CreateCallback<Person>) : void {
    if (typename !== 'Person') throw new Error(`incorrect typename=${typename}`)
    db.create(value, done)
}


function read(id: Database.DatabaseID, done: Database.ReadCallback<Person>): void {
    db.read(id, done)
}


function update(id: Database.DatabaseID, updates: Database.UpdateFieldCommand[], done: Database.UpdateSingleCallback<Person>): void {
    db.update({_id: id}, updates, undefined, done)
}


function del(id: Database.DatabaseID, done: Database.DeleteSingleCallback): void {
    db.del(id, done)
}

    // export interface IDatabaseCursor {
    //     start_offset?:  number
    //     count?:         number
    // }
    // export interface IUpdateFieldCommand {
    //     cmd:            string;     // set, unset, and for arrays: insert, remove
    //     field:          string
    //     key_field?:     string;     // The field that contains the unique key of an array element
    //     element_id?:    any;        // The unique key of an array element, required for selecting an array element
    //     subfield?:      string;     // the path within the array element for the value to be updated
    //     value?:         any
    // }
    // interface IRequestQuery {
    //     ids?:           string[];   // DatabaseObjectID
    //     conditions?:    any
    //     fields?:        string[]
    //     sort?:          any
    //     cursor?:        IDatabaseCursor
    // }
    // interface IRequest {
    //     action:         string
    //     // TYPENAME?:      T;    // used only by create, indexed by cscFrameworkServer.typename_key
    //     query?:         IRequestQuery
    //     updates?:       IUpdateFieldCommand[]
    // }

function find(conditions : Database.Conditions, fields: Database.Fields, sort: Database.Sort, cursor: Database.Cursor, done: Database.FindCallback<Person>) : void {
    db.find(conditions, fields, sort, cursor, done)
}


var people_db_mongo = {
    connect,
    create,
    read,
    update,
    del,
    find,
    test: {
    }
}


export = people_db_mongo
