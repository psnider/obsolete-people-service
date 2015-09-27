/// <reference path='../../../typings/angularjs/angular.d.ts' />
/// <reference path='../../../typings/people-service/people-ng-service.d.ts' />
/// <reference path='../../../typings/people-service/Main-Controller.d.ts' />
/// <reference path='../../../typings/people-service/PageHeader-Directive.d.ts' />
define(["require", "exports", 'people-ng-service', 'Main-Controller', 'PageHeader-Directive'], function (require, exports, PeopleService, Main_Controller, PageHeader_Directive) {
    //----------------------------------------------------------------------
    // start AngularJS setup
    //----------------------------------------------------------------------
    //var peopleModule = angular.module('People', ['ngRoute', 'ui.bootstrap']);  // for use with ng-app tag in HTML
    var peopleModule = angular.module('People-App'); // for bootstrap
    //----------------------------------------------------------------------
    // directives
    //----------------------------------------------------------------------
    peopleModule.directive('people-page-header', PageHeader_Directive.directive);
    //----------------------------------------------------------------------
    // services
    //----------------------------------------------------------------------
    peopleModule.factory('People-Service', ['$rootScope', '$q', '$http', PeopleService.service]);
    //----------------------------------------------------------------------
    // controllers
    //----------------------------------------------------------------------
    peopleModule.controller('Main-Controller', ['$scope', '$route', '$routeParams', '$location', 'People-Service', Main_Controller.controller]);
    //----------------------------------------------------------------------
    // filters
    //----------------------------------------------------------------------
    //----------------------------------------------------------------------
    // routing
    //----------------------------------------------------------------------
    peopleModule.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
            $routeProvider.when('/', {});
            $routeProvider.otherwise({ redirectTo: '/' });
        }]);
    //----------------------------------------------------------------------
    // startup
    //----------------------------------------------------------------------
    peopleModule.run(function ($http, $q) {
    });
    console.info('People-App started');
});
