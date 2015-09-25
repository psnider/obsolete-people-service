/// <reference path='../angularjs/angular.d.ts' />
/// <reference path='Person.d.ts' />
/// <reference path='people-protocol.d.ts' />


declare module 'people-service' {


    export interface IService {
        request:                    (query : PeopleProtocol.Request) => ng.IPromise<PeopleProtocol.Response>;
    }

    export function service($rootScope, $q, $http) : IService;
}
