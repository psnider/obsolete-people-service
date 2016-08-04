var client_framework;   // IFramework_ClientModule
var common_framework;   // IFramework_CommonModule alias for client_framework, for TypeScript

/**
 * loads sub modules and wraps them up into the main module
 * this should be used for top-level module definitions only
 */
define([
    'angular',
    'angular-route',
    'ui-bootstrap-tpls'
], function (ng, angular_route, ui_bootstrap_tpls) {
    'use strict';
    var peopleModule = ng.module('People-App', ['ngRoute', 'ui.bootstrap']);

    require(['People-App'], function (app_ref) {
        require(['domReady!'], function (document) {
            ng.bootstrap(document, ['People-App']);
        });
    });

    return peopleModule;
});
