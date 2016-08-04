const gulp = require('gulp')
const runSequence = require('run-sequence');

const ts = require('gulp-typescript')
const flatten = require('gulp-flatten')
const mocha = require('gulp-spawn-mocha');
const env = require('gulp-env');
const wait = require('gulp-wait')
var   Server = require('karma').Server;
var protractor = require("gulp-protractor").protractor;
const del = require('del');
const minimist = require('minimist');
const child_process = require('child_process');

var knownOptions = {
    string: ['env', 'hostname', 'port', 'mongo-path', 'node-inspector-port' ],
    boolean: ['debug', 'local-only' ],
    default: { env: process.env.NODE_ENV || 'production' }
};


var options = minimist(process.argv.slice(2), knownOptions);



// returns a Promise, resolving with the child process, or rejecting with an Error
function startProcess(options) {
    return new Promise(function(resolve, reject) {
        // DEBUG: console.log(`starting ${options.cmd} ${options.args}`)
        var child = child_process.spawn(options.cmd, options.args)
        child.on('error', (err) => {
            reject(err)
        });
        child.on('exit', (code, signal) => {
            // DEBUG: console.log(`exit ${options.cmd} ${options.args}: code=${code} signal=${signal}`)
        });
        var delay = options.delay || 0
        setTimeout(() => {
            resolve({child})
        }, delay)
    })
}


// returns a Promise, resolving with an array of the child processes, or rejecting with an Error
function startProcesses(processes) {
    var promises = []
    processes.forEach((process) => {
        promises.push(startProcess(process))
    })
    return Promise.all(promises)
}


// returns a Promise, resolving with the child process
function stopProcess(options) {
    return new Promise(function(resolve, reject) {
        // DEBUG: console.log(`stopping ${options.child.spawnargs}`)
        child_process.exec(`pgrep -P ${options.child.pid}`, (error, stdout, stderr) => {
            // DEBUG: console.log('child.kill(SIGINT)')
            options.child.kill('SIGINT')
            // DEBUG: console.log(`pgrep -P ${options.child.pid}  =>  ${stdout}`)
            var childs_children = stdout.trim().split(/\s/)
            childs_children.forEach((childs_child) => {
                // DEBUG: console.log(`kill -KILL ${childs_child}`)
                child_process.exec(`kill -KILL ${childs_child}`, (error, stdout, stderr) => {
                    if (error) {
                        reject(error)
                    }
                })
            })
            var delay = options.delay || 0
            setTimeout(() => {
                resolve()
            }, delay)
        })
    })
}


// returns a Promise, resolving with an array of the child processes
function stopProcesses(children) {
    var promises = []
    // DEBUG: console.log(`children=${children}`)
    children.forEach((child) => {
        promises.push(stopProcess(child))
    })
    return Promise.all(promises)
}


function runServers() {
    var processes = [
        // Cannot figure out how to programmatically shut down webdriver-manager
        // It seems it hangs gulp (due to child processes, other resources)?
        {cmd:'node_modules/gulp-protractor/node_modules/protractor/bin/webdriver-manager', args: ['start'], delay: 2000},
        // {cmd:'/usr/bin/vim', args: ['vim.tmp'], delay: 1000},
        // {cmd:'/usr/bin/vim', args: ['vim2.tmp'], delay: 1000}
        {cmd:'/usr/local/bin/node', args: ['generated/commonjs/people-pin-service.js'], delay: 1000},
        {cmd:'/usr/local/bin/node', args: ['generated/commonjs/people-app.js'], delay: 1000}
    ]
    return startProcesses(processes)
}


////////////////////////////////////////////////////////////////////////////////
// Task creation functions

function copyDir(task_name, srcs, dest_dir) {
    gulp.task(task_name, function() {
        return gulp.src(srcs)
            .pipe(gulp.dest(dest_dir))
    })
}


function addTask_BuildTSConfig(task_name, tsconfig_dir, dest_dir, data_subdir) {
    var dependencies = []
    if (data_subdir) {
        var copy_task_name = task_name + '-' + data_subdir
        dependencies.push(copy_task_name)
        var srcs = tsconfig_dir + '/' + data_subdir + '/*'
        var data_dest_dir = dest_dir + '/' + data_subdir
        copyDir(copy_task_name, srcs, data_dest_dir)
    }
    gulp.task(task_name, dependencies, function() {
        var tsconfig_name = tsconfig_dir + '/tsconfig.json'
        var tsProject = ts.createProject(tsconfig_name)
        return tsProject.src()
            .pipe(ts(tsProject)).js
            .pipe(flatten())
            .pipe(gulp.dest(dest_dir))
    })
}



function addTask_TestWithMocha(task_name, dependent_tasks, module_root, mocha_testfilenames) {
    gulp.task(task_name, dependent_tasks, function() {
        //    how to set $(MOCHA_ARGS)
        var args = {
            reporter: 'spec',
            debugBrk: options.debug,
            env: {
                NODE_PATH: module_root,
                DISABLE_LOGGING: true
            }
        }
        return gulp.src(mocha_testfilenames, {read: false})
            // gulp-mocha needs filepaths so you can't have any plugins before it
            .pipe(mocha(args));
    });
}



////////////////////////////////////////////////////////////////////////////////
// all


// TODO: figure out how to pass boolean args without a value
//  e.g. gulp --debug test-server
//  consumes test-server, and issues error that default is undefined
gulp.task('help', () => {
    console.log('Options:')
    console.log('--env (development | qa | production)')
    console.log('    Sets server execution environment, defaults to development')
    console.log('--hostname hostname')
    console.log('    Sets the remote host, for automated tests using the network, defaults to localhost')
    console.log('--port port')
    console.log('    Sets the port for the server API, defaults to 80')
    console.log('--mongo-path path')
    console.log('    Sets the mongo database, for automated tests')
    console.log('--debug')
    console.log('    Runs mocha for the target in debug mode')
    console.log('--node-inspector-port port')
    console.log('    Sets the port for node-inspector')
    console.log('--local-only')
    console.log('    Runs the server in local-only mode, for automated tests without the network')
})


gulp.task('clean', () => {
    return del(['generated']);
})


gulp.task('build', ['build-browser-angular1', 'build-server'])

// NOTE: it appears that 'test-server' and 'test-end-to-end' can interfere with each other if run concurrently
gulp.task('test', function() {
    runSequence(
        'test-browser-angular1',
        'test-server',
        'test-end-to-end'
    );
});

////////////////////////////////////////////////////////////////////////////////
// server

addTask_BuildTSConfig('build-server', 'components/server/src', './generated/commonjs')
addTask_BuildTSConfig('build-server-tests', 'components/server/test', './generated/commonjs/server/test', 'data')
addTask_TestWithMocha('test-server', ['build-server', 'build-server-tests'], './generated/commonjs'
, ['generated/commonjs/server/test/*.tests.js'])



////////////////////////////////////////////////////////////////////////////////
// browser

addTask_BuildTSConfig('build-browser-angular1', 'components/browser-angular1/src', './generated/amd/browser-angular1')
addTask_BuildTSConfig('build-browser-angular1-tests', 'components/browser-angular1/test', './generated/amd/browser-angular1/test', 'data')


gulp.task('test-browser-angular1', ['build-browser-angular1', 'build-browser-angular1-tests'], function(done) {
    new Server({
        configFile: __dirname + '/components/browser-angular1/test/people-ng-service.karma.conf.js',
        singleRun: true
    }, done).start();
});


////////////////////////////////////////////////////////////////////////////////
// end-to-end

addTask_BuildTSConfig('build-end-to-end-tests', 'components/test-end-to-end', './generated/commonjs/e2e/test', 'data')


var test_end_to_end_promises
gulp.task('start-servers-for-end-to-end-tests', ['build-browser-angular1', 'build-server'], function() {
    test_end_to_end_promises = runServers()
    return test_end_to_end_promises
});


gulp.task('test-end-to-end', ['start-servers-for-end-to-end-tests', 'build-end-to-end-tests'], function(done) {
    // TODO: set NODE_ENV=tests
    var stream = gulp.src(["./test/*.js"])
        .pipe(protractor({
            configFile: "components/test-end-to-end/protractor.conf.js",
            args: ['--framework', 'mocha']
        }))
        .on('error', function(e) { throw e })
    stream.on('end', function() {
        test_end_to_end_promises.then((children) => {
            stopProcesses(children).then(() => {
                // DEBUG: console.log('stopProcesses resolved')
                done()
            })
        })
    });
});
