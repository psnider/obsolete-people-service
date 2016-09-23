import Database = require('document-database-if')
import PERSON = require('Person')
type Person = PERSON.Person
import {InMemoryDB} from './people-db-in-memory'

var db: Database.DocumentDatabase<Person>


if (!db) {
    db = new InMemoryDB('people', 'Person')
}

export = db
