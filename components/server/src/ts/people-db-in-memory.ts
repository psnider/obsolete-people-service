// import mongoose = require('mongoose')
// mongoose.Promise = Promise
import pino = require('pino')
import HTTP_STATUS = require('http-status-codes')

import configure = require('configure-local')
import {ArrayCallback, Conditions, Cursor, DatabaseID, DocumentDatabase, ErrorOnlyCallback, Fields, ObjectCallback, ObjectOrArrayCallback, Sort, UpdateFieldCommand} from 'document-database-if'
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


export class InMemoryDB implements DocumentDatabase<Person> {

    next_id: number
    index: {[_id:string]: Person}
    

    constructor(_id: string, typename: string) {
        this.next_id = 1
        this.index = {}
    }


    getNextId(): string {
        return (this.next_id++).toString()
    }


    cloneFromIndex(_id) {
        var person = this.index[_id]
        return cloneObject(person)
    }


    connect(done?: ErrorOnlyCallback): Promise<void> | void {
        if (done) {
            done()
        } else {
            return Promise.resolve()
        }
    }


    disconnect(done?: ErrorOnlyCallback): Promise<void> | void {
        if (done) {
            done()
        } else {
            return Promise.resolve()
        }
    }


    // create(obj: T): Promise<T>
    // create(obj: T, done: CreateCallback<T>): void
    create(value: Person, done?: ObjectCallback<Person>): any {
        if (done) {
            if (value['_id'] == null) {
                var person = cloneObject(value)
                person._id = this.getNextId()
                this.index[person._id] = person
                done(undefined, person)
            } else {
                var error = newError('_id isnt allowed for create', HTTP_STATUS.BAD_REQUEST)
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


    // read(_id : string) : Promise<T>
    // read(_id : string, done: ReadCallback<T>) : void
    read(_id: DatabaseID, done?: ObjectCallback<Person>): any {
        if (done) {
            if (_id) {
                var person = this.cloneFromIndex(_id)
                done(undefined, person)
            } else {
                done(new Error ('_id is invalid'))
            }
        } else {
            return this.promisify_read(_id)
        }
    }


    promisify_read(_id: DatabaseID): Promise<Person> {
        return new Promise((resolve, reject) => {
            this.read(_id, (error, result) => {
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
    replace(obj: Person, done?: ObjectCallback<Person>): any {
        if (done) {
            var existing = this.index[obj._id]
            if (existing) {
                // the returned object is different from both the object saved, and the one provided
                this.index[obj._id] = cloneObject(obj)
                done(undefined, cloneObject(obj))
            } else {
                done(newError(`_id is invalid`, HTTP_STATUS.BAD_REQUEST))
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
    update(conditions : Conditions, updates: UpdateFieldCommand[], done?: ObjectCallback<Person>) : any {
        if (done) {
            var person = this.index[conditions['_id']]
            if (person) {
                if (updates.length !==  1) throw new Error('update only supports one UpdateFieldCommand at a time')
                let update = updates[0]
                if (update.cmd !== 'set') throw new Error('update only supports UpdateFieldCommand.cmd==set')
                person[update.field] = update.value
                done(undefined, person)
            } else {
                done(newError(`_id is invalid`, HTTP_STATUS.BAD_REQUEST))
            }
        } else {
            return this.promisify_update(conditions, updates)
        }
    }


    promisify_update(conditions : Conditions, updates: UpdateFieldCommand[]): Promise<Person> {
        return new Promise((resolve, reject) => {
            this.update(conditions, updates, (error, result) => {
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
    del(_id: DatabaseID, done?: ErrorOnlyCallback): any {
        if (done) {
            if (_id != null) {
                var person = this.index[_id]
                if (person) {
                    delete this.index[_id]
                }
                done()
            } else {
                done(newError(`_id is invalid`, HTTP_STATUS.BAD_REQUEST))
            }
        } else {
            return this.promisify_del(_id)
        }
    }


    promisify_del(_id: DatabaseID): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.del(_id, (error) => {
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
    find(conditions: Conditions, fields: Fields, sort: Sort, cursor: Cursor, done?: ArrayCallback<Person>) : any {
        if (done) {
            let keys = []
            if (conditions) {
                if (Object.keys(conditions).length != 1) {
                    done(new Error())
                    return
                }
                let query_field = Object.keys(conditions)[0]
                let query_value = conditions[query_field]
                for (var key in this.index) {
                    let value = this.index[key]
                    if (value[query_field] === query_value) {
                        keys.push(key)
                    }
                }
            } else {
                keys = Object.keys(this.index)
            }
            let start = (cursor && cursor.start_offset) ? cursor.start_offset : 0
            let count = (cursor && cursor.count) ? cursor.count : 10
            var sliced_keys = keys.slice(start, start + count)
            let results = sliced_keys.map((key) => {return this.index[key]})
            done(undefined, results)
        } else {
            return this.promisify_find(conditions, fields, sort, cursor)
        }
    }


    promisify_find(conditions: Conditions, fields: Fields, sort: Sort, cursor): Promise<Person[]> {
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
