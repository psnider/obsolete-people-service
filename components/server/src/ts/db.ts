import pino = require('pino')

import configure = require('configure-local')
import {MicroServiceConfig} from '../../../../config/micro-service-config'
import {DocumentDatabase, DocumentID} from 'document-database-if'
import {InMemoryDB} from 'in-memory-db'
import {MongoDBAdaptor} from 'mongodb-adaptor'
import {DataType, DataModel} from './document-data.plugin'


var log = pino({name: 'people-db'})
var db: DocumentDatabase<DataType>

// TODO: change to take db from fixed path, set by a link
// test programs should set the configuration of people:db:*
if (!db) {
    let config = <MicroServiceConfig>configure.get('people')
    log.info({config})
    switch (config.db.type) {
        case 'InMemoryDB':
            db = new InMemoryDB('people', 'Person')
            break
        case 'MongoDBAdaptor':
            let port = config.db.port
            let url_template = config.db.url
            let url = url_template.replace('${people:db:port}', port.toString())
            db = new MongoDBAdaptor<DataType>(url, DataModel)
            break
        default:
            throw new Error(`people:db:type must be configured to be either: InMemoryDB or MongoDBAdaptor`)
    }
}


export = db
