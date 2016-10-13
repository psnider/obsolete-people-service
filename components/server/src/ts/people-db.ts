import pino = require('pino')

import configure = require('configure-local')
import Database = require('document-database-if')
import PERSON = require('Person')
type Person = PERSON.Person
import {InMemoryDB} from './people-db-in-memory'
import {MongoDBAdaptor} from 'mongodb-adaptor'
import {PersonModel} from './person.mongoose-schema'

var log = pino({name: 'people-db'})
var db: Database.DocumentDatabase<Person>

if (!db) {
    let db_type = configure.get('people:db:type')
    log.info({'people:db:type': db_type})
    switch (db_type) {
        case 'InMemoryDB':
            db = new InMemoryDB('people', 'Person')
            break
        case 'MongoDBAdaptor':
            let port = configure.get('people:db:port')
            let url_template = configure.get('people:db:url')
            let url = url_template.replace('${people:db:port}', port)
            db = new MongoDBAdaptor<Person>(url, PersonModel)
            break
        default:
            throw new Error(`people:db:type must be configured to be either: InMemoryDB or MongoDBAdaptor`)
    }
}


export = db
