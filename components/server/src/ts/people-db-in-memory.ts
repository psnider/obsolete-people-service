// import mongoose = require('mongoose')
// mongoose.Promise = Promise
import pino = require('pino')
import HTTP_STATUS = require('http-status-codes')

import configure = require('configure-local')
import Database = require('document-database-if')
import PERSON = require('Person')
type Person = PERSON.Person

var log = pino({name: 'people-db', enabled: !process.env.DISABLE_LOGGING})


function cloneObject(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj
    }
    var temp = obj.constructor() // give temp the original obj's constructor
    for (var key in obj) {
        temp[key] = cloneObject(obj[key])
    }
    return temp
}


function newError(msg, status) {
    let error = new Error(msg)
    error['http_status'] = status
    return error
}


export class InMemoryDB implements Database.DocumentDatabase<Person> {

    next_id: number
    index: {[id:string]: Person}
    

    constructor(id: string, typename: string) {
        this.next_id = 1
        this.index = {}
    }


    getNextId(): string {
        return (this.next_id++).toString()
    }


    cloneFromIndex(id) {
        var person = this.index[id]
        return cloneObject(person)
    }


    // create(obj: T): Promise<T>
    // create(obj: T, done: CreateCallback<T>): void
    create(value: Person, done?: Database.CreateCallback<Person>): any {
        if (done) {
            if (value['id'] == null) {
                var person = cloneObject(value)
                person.id = this.getNextId()
                this.index[person.id] = person
                done(undefined, person)
            } else {
                var error = newError('id isnt allowed for create', HTTP_STATUS.BAD_REQUEST)
                done(error)
            }
        } else {
            return this.promisify_create(value)
        }
    }

    promisify_create(value: Person): Promise<Person> {
        return new Promise((resolve, reject) => {
            this.create(value, (error, result) => {
                if (!error) {
                    resolve(result)
                } else {
                    reject(error)
                }
            })
        })
    }


    // read(id : string) : Promise<T>
    // read(id : string, done: ReadCallback<T>) : void
    read(id: Database.DatabaseID, done?: Database.ReadCallback<Person>): any {
        if (done) {
            var person = this.cloneFromIndex(id)
            if (person) {
                done(undefined, person)
            } else {
                done(newError(`id is invalid`, HTTP_STATUS.BAD_REQUEST))
            }
        } else {
            return this.promisify_read(id)
        }
    }


    promisify_read(id: Database.DatabaseID): Promise<Person> {
        return new Promise((resolve, reject) => {
            this.read(id, (error, result) => {
                if (!error) {
                    resolve(result)
                } else {
                    reject(error)
                }
            })
        })
    }


    // replace(obj: T) : Promise<T>
    // replace(obj: T, done: ReplaceCallback<T>) : void
    replace(obj: Person, done?: Database.ReadCallback<Person>): any {
        if (done) {
            var existing = this.index[obj.id]
            if (existing) {
                // the returned object is different from both the object saved, and the one provided
                this.index[obj.id] = cloneObject(obj)
                done(undefined, cloneObject(obj))
            } else {
                done(newError(`id is invalid`, HTTP_STATUS.BAD_REQUEST))
            }
        } else {
            return this.promisify_replace(obj)
        }
    }


    promisify_replace(obj: Person): Promise<Person> {
        return new Promise((resolve, reject) => {
            this.replace(obj, (error, result) => {
                if (!error) {
                    resolve(result)
                } else {
                    reject(error)
                }
            })
        })
    }


    // update(conditions : Conditions, updates: UpdateFieldCommand[], getOriginalDocument?: GetOriginalDocumentCallback<T>) : Promise<T>
    // update(conditions : Conditions, updates: UpdateFieldCommand[], getOriginalDocument: GetOriginalDocumentCallback<T>, done: UpdateSingleCallback<T>) : void
    update(conditions : Database.Conditions, updates: Database.UpdateFieldCommand[], getOriginalDocument: Database.GetOriginalDocumentCallback<Person>, done?: Database.UpdateSingleCallback<Person>) : any {
        if (done) {
            var person = this.index[conditions['id']]
            if (person) {
                if (updates.length !==  1) throw new Error('update only supports one UpdateFieldCommand at a time')
                let update = updates[0]
                if (update.cmd !== 'set') throw new Error('update only supports UpdateFieldCommand.cmd==set')
                person[update.field] = update.value
                done(undefined, person)
            } else {
                done(newError(`id is invalid`, HTTP_STATUS.BAD_REQUEST))
            }
        } else {
            return this.promisify_update(conditions, updates, getOriginalDocument)
        }
    }


    promisify_update(conditions : Database.Conditions, updates: Database.UpdateFieldCommand[], getOriginalDocument: Database.GetOriginalDocumentCallback<Person>): Promise<Person> {
        return new Promise((resolve, reject) => {
            this.update(conditions, updates, getOriginalDocument, (error, result) => {
                if (!error) {
                    resolve(result)
                } else {
                    reject(error)
                }
            })
        })
    }


    // del(conditions : Conditions, getOriginalDocument?: (doc : T) => void) : Promise<void>
    // del(conditions : Conditions, getOriginalDocument: (doc : T) => void, done: DeleteSingleCallback) : void
    del(id: Database.DatabaseID, done?: Database.DeleteSingleCallback): any {
        if (done) {
            var person = this.index[id]
            if (person) {
                delete this.index[id]
                done()
            } else {
                done(newError(`id is invalid`, HTTP_STATUS.BAD_REQUEST))
            }
        } else {
            return this.promisify_del(id)
        }
    }


    promisify_del(id: Database.DatabaseID): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.del(id, (error) => {
                if (!error) {
                    resolve()
                } else {
                    reject(error)
                }
            })
        })
    }



    // find(conditions : Conditions, fields?: Fields, sort?: Sort, cursor?: Cursor) : Promise<T[]> 
    // find(conditions : Conditions, fields: Fields, sort: Sort, cursor: Cursor, done: FindCallback<T>) : void
    find(conditions: Database.Conditions, fields: Database.Fields, sort: Database.Sort, cursor: Database.Cursor, done?: Database.FindCallback<Person>) : any {
        if (done) {
            let start = (cursor && cursor.start_offset) ? cursor.start_offset : 0
            let count = (cursor && cursor.count) ? cursor.count : 10
            var keys = Object.keys(this.index).slice(start, start + count)
            let results = keys.map((key) => {return this.index[key]})
            done(undefined, results)
        } else {
            return this.promisify_find(conditions, fields, sort, cursor)
        }
    }


    promisify_find(conditions: Database.Conditions, fields: Database.Fields, sort: Database.Sort, cursor): Promise<Person[]> {
        return new Promise<Person[]>((resolve, reject) => {
            this.find(conditions, fields, sort, cursor, (error, result) => {
                if (!error) {
                    resolve(result)
                } else {
                    reject(error)
                }
            })
        })
    }

}
