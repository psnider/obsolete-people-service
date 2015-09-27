/// <reference path='../angularjs/angular.d.ts' />
/// <reference path='Person.d.ts' />


interface MainScope extends ng.IScope {
    login_email:      string;
    login_user:       Person.Person;
    //config:           Config;

    changeView:       (path : string) => void;
}
