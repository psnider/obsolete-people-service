/// <reference path='../../../typings/angularjs/angular.d.ts' />
/// <reference path='../../../typings/people-service/MainScope.d.ts' />
define(["require", "exports"], function (require, exports) {
    // the Main-Controller, for the outermost page that contains the main ng-view
    function controller($scope, $route, $routeParams, $location, people_svc) {
        $scope.changeView = function (path) {
            $location.path(path);
        };
    }
    exports.controller = controller;
});
