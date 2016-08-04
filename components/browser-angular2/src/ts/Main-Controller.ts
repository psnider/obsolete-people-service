/// <reference path="../../../../typings/browser.d.ts" />



// the Main-Controller, for the outermost page that contains the main ng-view
export function controller($scope : MainScope, $route, $routeParams, $location, people_svc) {

    $scope.changeView = function(path  : string) : void {
        $location.path(path);
    };

}
