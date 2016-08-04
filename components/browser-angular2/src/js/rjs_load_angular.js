var tv4;
/**
 * bootstraps angular onto the window.document node
 * NOTE: the ng-app attribute should not be on the index.html when using ng.bootstrap
 */
define([
    'require',
    'angular',
    'tv4'
], function (require, ng, tv4_module) {
    'use strict';
    tv4 = tv4_module;

    /*
     * place operations that need to initialize prior to app start here
     * using the `run` function on the top-level module
     */
    require(['rjs_load_angular_deps'], function (app_module) {
    });
});
