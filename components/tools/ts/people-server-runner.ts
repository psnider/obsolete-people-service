import child_process = require('child_process')
import fs = require('fs')


export interface Options {
    port?: number,
    disable_console_logging?: boolean
    save_log?: boolean
    closeHandler?: (code: number) => void
    env?: {}
}


export class PeopleServerRunner {

    static STARTUP_TIME = 1000
    static SHUTDOWN_TIME = 100
    log_file: number
    spawned_proc: child_process.ChildProcess


    constructor(private options?: Options) {
        this.options = options || {}
    }


    start(ready: () => void) {
        // if (this.options.save_log) {
        //     var timestamp = (new Date()).toISOString()
        //     var log_filename = `logs/people.${timestamp}.log`
        //     this.log_file = fs.openSync(log_filename, 'w')
        // }
        var args = ['generated/server/server/src/ts/server.js']
        if (this.options.port != null) {
            process.env['people:port'] = this.options.port
        }
        // default options pass process.env along
        var env = {}
        Object.assign(env, process.env)
        if (this.options.env) {
            Object.assign(env, this.options.env)
        }
        this.spawned_proc = child_process.spawn('node', args, {env})
        this.spawned_proc.stdout.on('data', (data) => {
            // if (this.options.save_log) {
            //     fs.write(this.log_file, data, (error) => {
            //         if (error) {
            //             console.log(`error=${error}`)
            //         }
            //     })
            // } else {
            //     if (!this.options.disable_console_logging) {
                    console.log(data.toString())
            //     }
            // }
        })
        this.spawned_proc.stderr.on('data', (data) => {
            // if (this.options.save_log) {
            //     fs.write(this.log_file, data, (error) => {
            //         if (error) {
            //             console.log(`error=${error}`)
            //         }
            //     })
            // } else {
            //     if (!this.options.disable_console_logging) {
                    console.error(data.toString())
            //     }
            // }
        })
        var defaultCloseHandler = (code) => {
            if (!this.options.disable_console_logging) {
                console.log(`people-server exited with code=${code}`)
            }
        }
        this.spawned_proc.on('close', this.options.closeHandler || defaultCloseHandler)
        // give server a chance to start up
        setTimeout(ready, PeopleServerRunner.STARTUP_TIME)
    }



    stop(done: () => void) {
        this.spawned_proc.kill('SIGTERM')
        // give server a chance to shut down
        setTimeout(done, PeopleServerRunner.SHUTDOWN_TIME)
    }

}

