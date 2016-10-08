import Database = require('document-database-if')
import PERSON = require('Person')
type Person = PERSON.Person
//import {InMemoryDB} from './people-db-in-memory'
import {MongoDBAdaptor} from 'mongodb-adaptor'
import {PersonModel} from './person.mongoose-schema'

var db: Database.DocumentDatabase<Person>

var PORT = 27016

if (!db) {
    var mongo_path = `localhost:${PORT}/test`
    db = new MongoDBAdaptor<Person>(mongo_path, PersonModel)
}

export = db
