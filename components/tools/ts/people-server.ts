import child_process = require('child_process')
import fs = require('fs')


export interface Options {
    disable_console_logging?: boolean
    save_log?: boolean
    closeHandler?: (code: number) => void
}


export class PeopleServer {

    static STARTUP_TIME = 1000
    static SHUTDOWN_TIME = 100
    spawned_proc: child_process.ChildProcess


    constructor(private options?: Options) {
        this.options = options || {}
    }


    start(ready: () => void) {
        if (this.options.save_log) {
            var timestamp = (new Date()).toISOString()
            var log_filename = `logs/people.${timestamp}.log`
            var file = fs.openSync(log_filename, 'w')
        }
        var args = ['generated/server/server/src/ts/people-server.js']
        // default options pass process.env along
        this.spawned_proc = child_process.spawn('node', args)
        this.spawned_proc.stdout.on('data', (data) => {
            if (this.options.save_log) {
                fs.write(file, data, (error) => {
                    console.log(`error=${error}`)
                })
            } else {
                if (!this.options.disable_console_logging) {
                    console.log(data.toString())
                }
            }
        })
        this.spawned_proc.stderr.on('data', (data) => {
            if (this.options.save_log) {
                fs.write(file, data, (error) => {
                    console.log(`error=${error}`)
                })
            } else {
                if (!this.options.disable_console_logging) {
                    console.error(data.toString())
                }
            }
        })
        var defaultCloseHandler = (code) => {
            if (!this.options.disable_console_logging) {
                console.log(`people-server exited with code=${code}`)
            }
        }
        this.spawned_proc.on('close', this.options.closeHandler || defaultCloseHandler)
        // give server a chance to start up
        setTimeout(ready, PeopleServer.STARTUP_TIME)
    }



    stop(done: () => void) {
        this.spawned_proc.kill('SIGTERM')
        // give server a chance to shut down
        setTimeout(done, PeopleServer.SHUTDOWN_TIME)
    }

}

