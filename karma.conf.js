// Karma configuration
// Generated on Sun Oct 20 2013 07:28:56 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['mocha', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [
        {pattern: 'bower_components/angular/angular.js', included: false},
        {pattern: 'bower_components/angular-mocks/angular-mocks.js', included: false},
//        {pattern: 'bower_components/angular-mocks/ngMockE2E.js', included: false},
//        {pattern: 'bower_components/angular-route/angular-route.js', included: false},
        {pattern: 'node_modules/chai/chai.js', included: false},
        // run the test from the bower install location
        {pattern: 'config/config.json', included: false},
        {pattern: 'amd/Person.js', included: false},
        {pattern: 'amd/people.service.js', included: false},
        {pattern: 'amd/people.service.tests.js', included: false},
//        {pattern: 'amd/StringUtils.js', included: false},
        {pattern: 'test/lib/*.js', included: false},

        'test-main.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // test result reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true

  });
};
