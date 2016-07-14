exports.config = {
    // seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['../../generated/commonjs/e2e/test/people-api.e2e-tests.js'],
    seleniumServerJar: '../../node_modules/gulp-protractor/node_modules/protractor/selenium/selenium-server-standalone-2.52.0.jar'
};
