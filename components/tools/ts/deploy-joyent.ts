import child_process = require('child_process')
import minimist = require('minimist');

import configure = require('configure-local')



var knownOptions = {
    string: ['commit-id']
};


var options = minimist(process.argv.slice(2), knownOptions);


function help() {
    console.log('Options:')
    console.log('--commit-id sha1')
    console.log('    Specifies the commit-id to deploy from GitHub')
}


// @return Promise that resolves with stdout
function execWithAllOutput(cmd) {
    console.log(`execWithAllOutput(${cmd})`)
    return new Promise(function(resolve, reject) {
        const child = child_process.exec(cmd, (error, stdout, stderr) => {
            if (error) {
                error.message = `FAILED ${cmd}\n` + error.message
                reject(error)
            } else {
                if (stdout.length > 0) {
                    console.log('stdout:')
                    console.log(stdout)
                }
                if (stderr.length > 0) {
                    console.log('stderr:')
                    console.log(stderr)
                }
                resolve(stdout)
            }
        })
    })
}


function deployProductionToJoyent(done: (error: Error) => void) {
    // set NODE_ENV in order to get configuration for production
    process.env.NODE_ENV = 'production-joyent'
    configure.reloadConfig()
    const repo_dir = 'people-service'
    const commit_id = options['commit-id']
    const config = configure.get('people')
    const ssh_user = config['app-user'] + '@' + config['hostname']
    var promise = execWithAllOutput(`ssh ${ssh_user} "cd ${repo_dir}; git checkout master; git pull;"`)
    if (commit_id) {
        promise = promise.then(function() {
            return execWithAllOutput(`ssh ${ssh_user} "cd ${repo_dir}; git checkout ${commit_id};"`)
        })
    }
    promise = promise.then(function() {
        return execWithAllOutput(`ssh ${ssh_user} "source ~/.bash_ssh; cd ${repo_dir}; npm install;"`)
    })
    promise = promise.then(function() {
        return execWithAllOutput(`ssh ${ssh_user} "source ~/.bash_ssh; cd ${repo_dir}; npm run clean; npm run build;"`)
    })
    promise = promise.then(function() {
        return execWithAllOutput(`ssh ${ssh_user} "source ~/.bash_ssh; cd ${repo_dir}; npm run test;"`)
    })
    promise = promise.then(function() {
        return execWithAllOutput(`ssh ${ssh_user} "source ~/.bash_ssh; cd ${repo_dir}; npm run forever-restart-people-service;"`)
    })
    promise = promise.then(function() {
        return execWithAllOutput(`ssh ${ssh_user} "source ~/.bash_ssh; cd ${repo_dir}; npm run record-deployment;"`)
    })
    promise.catch(function(error) {
        done(error)
    })
}


