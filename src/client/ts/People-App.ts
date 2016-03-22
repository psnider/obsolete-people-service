/// <reference path="../../../typings/browser.d.ts" />


import PeopleService                    = require('people-ng-service');
import Main_Controller                  = require('Main-Controller');
import PageHeader_Directive             = require('PageHeader-Directive');


//----------------------------------------------------------------------
// start AngularJS setup
//----------------------------------------------------------------------

//var peopleModule = angular.module('People', ['ngRoute', 'ui.bootstrap']);  // for use with ng-app tag in HTML
var peopleModule = angular.module('People-App');  // for bootstrap



//----------------------------------------------------------------------
// directives
//----------------------------------------------------------------------

peopleModule.directive('people-page-header', PageHeader_Directive.directive);




//----------------------------------------------------------------------
// services
//----------------------------------------------------------------------


peopleModule.factory('People-Service',        ['$rootScope', '$q', '$http', PeopleService.service]);




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
  $routeProvider.when('/', {
  });
  $routeProvider.otherwise({redirectTo: '/'});
}]);




//----------------------------------------------------------------------
// startup
//----------------------------------------------------------------------
peopleModule.run(function($http, $q) {
});

console.info('People-App started');
