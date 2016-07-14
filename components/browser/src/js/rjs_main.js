/**
 * configure RequireJS
 * prefer named modules to long paths, especially for version mgt
 * or 3rd party libraries
 */
require.config({

    paths: {
        'angular':           'angular',  //  'angular.1.2.12',
        'angular-route':     'angular-route',  //  'angular-route.1.2.12',
        'domReady':          'domReady',
        'ui-bootstrap-tpls': 'ui-bootstrap-tpls'  //'ui-bootstrap-tpls.0.10.0.min'
    },

    /**
     * for libs that either do not support AMD out of the box, or
     * require some fine tuning to dependency mgt'
     */
    shim: {
        'angular': {
            exports: 'angular'
        },
        'angular-route': {
            deps: ['angular']
        }
    },

    deps: [
        // kick start application... see bootstrap.js
        'rjs_load_angular'
    ]
});
