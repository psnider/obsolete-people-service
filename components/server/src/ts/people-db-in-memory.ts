// import mongoose = require('mongoose')
// mongoose.Promise = Promise
import pino = require('pino')
import HTTP_STATUS = require('http-status-codes')

import configure = require('configure-local')
import {ArrayCallback, Conditions, Cursor, DatabaseID, DocumentDatabase, ErrorOnlyCallback, Fields, ObjectCallback, ObjectOrArrayCallback, Sort, UpdateFieldCommand} from 'document-database-if'
// we use MongoDBAdaptor.createObjectId()
import {MongoDBAdaptor} from 'mongodb-adaptor'
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

    connected: boolean
    index: {[_id:string]: Person}
    

    constructor(_id: string, typename: string) {
        this.connected = false
        this.index = {}
    }


    getNewId(): string {
        return MongoDBAdaptor.createObjectId()
    }


    isInIndex(_id) {
        return (this.index[_id] != null)
    }


    getFromIndex(_id) {
        if (_id == null) {
            throw new Error('getFromIndex: _id is unset')
        }
        return this.index[_id]
    }


    cloneFromIndex(_id) {
        if (_id == null) {
            throw new Error('cloneFromIndex: _id is unset')
        }
        var person = this.index[_id]
        var cloned = cloneObject(person)
        return cloned
    }


    addToIndex(obj) {
        if (obj._id == null) {
            throw new Error('addToIndex: obj._id is unset')
        }
        if (this.index[obj._id]) {
            log.warn(`overwriting object in index with _id=${obj._id}`)
        }
        this.index[obj._id] = cloneObject(obj)
    }


    deleteFromIndex(_id) {
        var obj = this.index[_id]
        if (obj) {
            delete this.index[_id]
        }
    }


    connect(done?: ErrorOnlyCallback): Promise<void> | void {
        this.connected = true
        if (done) {
            done()
        } else {
            return Promise.resolve()
        }
    }


    disconnect(done?: ErrorOnlyCallback): Promise<void> | void {
        this.connected = false
        if (done) {
            done()
        } else {
            return Promise.resolve()
        }
    }


    // create(obj: T): Promise<T>
    // create(obj: T, done: CreateCallback<T>): void
    create(obj: Person, done?: ObjectCallback<Person>): any {
        if (done) {
            if (this.connected) {
                if (obj['_id'] == null) {
                    var person = cloneObject(obj)
                    person._id = MongoDBAdaptor.createObjectId()
                    this.addToIndex(person)
                    done(undefined, person)
                } else {
                    var error = newError('_id isnt allowed for create', HTTP_STATUS.BAD_REQUEST)
                    done(error)
                }
            } else {
                var error = newError('not connected to database', HTTP_STATUS.INTERNAL_SERVER_ERROR)
                done(error)
            }
        } else {
            return this.promisify_create(obj)
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
            if (this.connected) {
                if (_id) {
                    var person = this.cloneFromIndex(_id)
                    done(undefined, person)
                } else {
                    done(new Error ('_id is invalid'))
                }
            } else {
                var error = newError('not connected to database', HTTP_STATUS.INTERNAL_SERVER_ERROR)
                done(error)
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
            if (this.connected) {
                if (this.isInIndex(obj._id)) {
                    // the returned object is different from both the object saved, and the one provided
                    this.addToIndex(obj)
                    done(undefined, this.cloneFromIndex(obj._id))
                } else {
                    done(newError(`_id is invalid`, HTTP_STATUS.BAD_REQUEST))
                }
            } else {
                var error = newError('not connected to database', HTTP_STATUS.INTERNAL_SERVER_ERROR)
                done(error)
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
            if (this.connected) {
                let _id = conditions['_id']
                var person = this.getFromIndex(_id)
                if (person) {
                    if (updates.length !== 1) throw new Error('update only supports one UpdateFieldCommand at a time')
                    let update = updates[0]
                    if (update.cmd !== 'set') throw new Error('update only supports UpdateFieldCommand.cmd==set')
                    person[update.field] = update.value
                    done(undefined, this.cloneFromIndex(_id))
                } else {
                    done(newError(`_id is invalid`, HTTP_STATUS.BAD_REQUEST))
                }
            } else {
                var error = newError('not connected to database', HTTP_STATUS.INTERNAL_SERVER_ERROR)
                done(error)
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
            if (this.connected) {
                if (_id != null) {
                    this.deleteFromIndex(_id)
                    done()
                } else {
                    done(newError(`_id is invalid`, HTTP_STATUS.BAD_REQUEST))
                }
            } else {
                var error = newError('not connected to database', HTTP_STATUS.INTERNAL_SERVER_ERROR)
                done(error)
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
            if (this.connected) {
                let matching_ids = []
                if (conditions) {
                    if (Object.keys(conditions).length != 1) {
                        done(new Error())
                        return
                    }
                    let query_field = Object.keys(conditions)[0]
                    let query_value = conditions[query_field]
                    for (var _id in this.index) {
                        let value = this.getFromIndex(_id)
                        if (value[query_field] === query_value) {
                            matching_ids.push(_id)
                        }
                    }
                } else {
                    matching_ids = Object.keys(this.index)
                }
                let start = (cursor && cursor.start_offset) ? cursor.start_offset : 0
                let count = (cursor && cursor.count) ? cursor.count : 10
                var sliced_matching_ids = matching_ids.slice(start, start + count)
                let results = sliced_matching_ids.map((_id) => {return this.cloneFromIndex(_id)})
                done(undefined, results)
            } else {
                var error = newError('not connected to database', HTTP_STATUS.INTERNAL_SERVER_ERROR)
                done(error)
            }
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
