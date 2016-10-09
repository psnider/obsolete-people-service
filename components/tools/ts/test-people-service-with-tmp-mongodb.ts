import child_process = require('child_process')
import fs = require('fs')

import {MongoDaemon, Options as MongoDaemonOptions} from 'mongod-runner'
import {PeopleServer, Options as PeopleServerOptions} from './people-server'
import {call_done_once} from '../../server/src/ts/test-support'









export interface Options {
    mongo_daemon?: MongoDaemonOptions
    people_server?: PeopleServerOptions
}


export class TestPeopleServiceWithTmpMongoDB {

    static MONGO_PORT = 27016 // one less than the default port
    mongo_daemon: MongoDaemon
    people_server: PeopleServer
    test_process: child_process.ChildProcess


    constructor(private cmd: string, private args: string[], private options?: Options) {
        this.options = options || {}
        if (!this.options.people_server) {
            this.options.people_server = {}
        }
        if (!this.options.mongo_daemon) {
            this.options.mongo_daemon = {}
        }
        this.options.mongo_daemon = {
            port: this.options.mongo_daemon.port || TestPeopleServiceWithTmpMongoDB.MONGO_PORT, 
            use_tmp_dir: true, 
            disable_logging: (this.options.mongo_daemon.disable_logging != null) || true
        }
        this.mongo_daemon = new MongoDaemon(this.options.mongo_daemon)
    }



    start(done: (error?: Error) => void) {
        var done_once = call_done_once(done)
        var peopleServerCloseHandler: (code: number) => void = (code) => {
            if (code === 1) {
                console.log('people-server exited normally in response to signal')
            } else {
                done_once(new Error(`people-server exited with code ${code}`))
            }
        }
        this.options.people_server.closeHandler = peopleServerCloseHandler
        this.people_server = new PeopleServer(this.options.people_server)
        this.mongo_daemon.start((error) => {
            if (!error) {
                this.people_server.start(() => {
                    this.test((code) => {
                        if (code === 0) {
                            console.log('test completed successfully')
                        } else {
                            console.error(`test failed with code=${code}`)
                        }
                        console.log('stopping people-server')
                        this.people_server.stop(() => {
                            console.log('stopping tmp mongodb')
                            this.mongo_daemon.stop(() => {
                                done_once()
                            })
                        })
                    })
                })
            } else {
                console.error(`Failed to start mongo daemon: error=${error}`)
                done_once(error)
            }
        })
    }


    test(closeHandler: (code: number) => void) {
        // default options pass process.env along
        this.test_process = child_process.spawn(this.cmd, this.args)
        this.test_process.stdout.on('data', function (data) {
            console.log(data.toString())
        })
        this.test_process.stderr.on('data', function (data) {
            console.error(data.toString())
        })
        this.test_process.on('close', closeHandler)
    }

}



/*
npm run clean
npm run build-server
npm run build-server-tests
npm run build-tools
var pswtmdb = require('generated/tools/tools/ts/test-people-service-with-tmp-mongodb.js')
var args=['-R','spec','generated/server/test/test/ts/people-service.tests.js']
var options = {people_server: {disable_console_logging: true}}
var test = new pswtmdb.TestPeopleServiceWithTmpMongoDB('mocha', args, options)
test.start((error) => {console.log(`END: error=${error}`)})

*/


export function run() {
    var args=['-R','spec','generated/server/test/test/ts/people-service.tests.js']
    var options = {people_server: {disable_console_logging: true}}
    var test = new TestPeopleServiceWithTmpMongoDB('mocha', args, options)
    test.start((error) => {
        if (!error) {
            process.exit(0)
        } else {
            console.log(`error=${error}`)
            process.exit(1)
        }
    })
}