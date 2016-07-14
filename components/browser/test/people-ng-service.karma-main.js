var allTestFiles = [];
var TEST_REGEXP = /\.(spec|tests)\.js$/i;

var pathToModule = function(path) {
  return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push(pathToModule(file));
  }
});


require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base',

  paths: {
      // OSS packages
      'angular':                            'bower_components/angular/angular',
      'angular-mocks/ngMockE2E':            'bower_components/angular-mocks/angular-mocks',
      'chai':                               'node_modules/chai/chai',
      'mocha.conf':                         'components/shared/test/lib/mocha.conf',
      'chai-expect':                        'components/shared/test/lib/chai-expect',

      // our Code
      // 'config/config.json':                 'config/config.json',
      'Person':                             'generated/amd/Person',
      'people-ng-service':                  'generated/amd/people-ng-service',
      'people-ng-service.tests':            'generated/amd/browser/test/people-ng-service.tests'
  },

  shim: {
      'angular': {
          exports: 'angular'
      },
      'angular-mocks/ngMockE2E': {
          deps: ['angular']
      },
      'mocha.conf': {
          deps: ['mocha']
      }
  },

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});
