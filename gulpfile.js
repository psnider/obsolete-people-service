const gulp = require('gulp')
const ts = require('gulp-typescript')
const flatten = require('gulp-flatten')
const mocha = require('gulp-spawn-mocha');
const env = require('gulp-env');
const wait = require('gulp-wait')
var   Server = require('karma').Server;
var protractor = require("gulp-protractor").protractor;
const del = require('del');
const minimist = require('minimist');


var knownOptions = {
    string: ['env', 'hostname', 'port', 'mongo-path', 'node-inspector-port' ],
    boolean: ['debug', 'local-only' ],
    default: { env: process.env.NODE_ENV || 'production' }
};


var options = minimist(process.argv.slice(2), knownOptions);

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


gulp.task('build', ['build-client', 'build-server'])


gulp.task('test', ['test-client', 'test-server', 'test-end-to-end'])


////////////////////////////////////////////////////////////////////////////////
// server


gulp.task('build-server', function() {
  return gulp.src(['src/server/**/*.ts', 'src/shared/**/*.ts'])
    .pipe(ts({module: 'commonjs'})).js
    .pipe(flatten())
    .pipe(gulp.dest('./generated/commonjs'))
});


gulp.task('build-server-tests', function() {
  return gulp.src(['test/src/server/**/*.ts'])
    .pipe(ts({module: 'commonjs'})).js
    .pipe(flatten())
    .pipe(gulp.dest('./generated/commonjs'))
});


gulp.task('test-server', ['build-server', 'build-server-tests'], function() {
    //    how to set $(MOCHA_ARGS)
    var args = {
        reporter: 'spec',
        debugBrk: options.debug,
        env: {
            NODE_PATH: './generated/commonjs'
        }
    }
    return gulp.src('generated/commonjs/people-service.tests.js', {read: false})
        // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha(args));
});


gulp.task('clean-server', function() {
    return del(['generated/commonjs']);
});




////////////////////////////////////////////////////////////////////////////////
// client

gulp.task('build-client', function() {
  var tsProject = ts.createProject('src/client/tsconfig.json')
  return tsProject.src()
    .pipe(ts(tsProject)).js
    .pipe(flatten())
    .pipe(gulp.dest('./generated/amd'))
});


gulp.task('build-client-tests', function() {
  return gulp.src(['test/src/client/**/*.ts'])
    .pipe(ts({module: 'amd'})).js
    .pipe(flatten())
    .pipe(gulp.dest('./generated/amd'))
});


gulp.task('test-client', ['build-client', 'build-client-tests'], function(done) {
    new Server({
        configFile: __dirname + '/test/src/client/people-ng-service.karma.conf.js',
        singleRun: true
    }, done).start();
});


gulp.task('clean-client', () => {
    return del(['generated/amd', 'generated/system']);
});



////////////////////////////////////////////////////////////////////////////////
// end-to-end


gulp.task('build-end-to-end-tests', function() {
  return gulp.src(['test/e2e/**/*.ts'])
    .pipe(ts({module: 'commonjs'})).js
    .pipe(flatten())
    .pipe(gulp.dest('./generated/commonjs'))
});



gulp.task('test-end-to-end', ['build-client', 'build-server', 'build-end-to-end-tests'], function() {
    console.warn("WARNING: Assuming you have already run: webdriver-manager start")
    console.warn("WARNING: Assuming you have already run: bin/start-servers.sh --log --save")
    var stream = gulp.src(["./test/*.js"])
        .pipe(protractor({
            configFile: "test/e2e/protractor.conf.js",
            args: ['--framework', 'mocha']
        }))
        .on('error', function(e) { throw e })
    stream.on('end', function() {
        console.warn("WARNING: You must manually stop the servers: bin/stop-servers.sh")
    });
    return stream
});
