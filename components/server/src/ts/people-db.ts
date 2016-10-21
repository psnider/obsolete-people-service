import pino = require('pino')

import configure = require('configure-local')
import {DocumentDatabase, DocumentID} from 'document-database-if'
import {InMemoryDB} from './people-db-in-memory'
import {MongoDBAdaptor} from 'mongodb-adaptor'
import {DataType, DataModel} from './document-data.plugin'


var log = pino({name: 'people-db'})
var db: DocumentDatabase<DataType>

// TODO: change to take db from fixed path, set by a link
// test programs should set the configuration of people:db:*
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
            db = new MongoDBAdaptor<DataType>(url, DataModel)
            break
        default:
            throw new Error(`people:db:type must be configured to be either: InMemoryDB or MongoDBAdaptor`)
    }
}


export = db
