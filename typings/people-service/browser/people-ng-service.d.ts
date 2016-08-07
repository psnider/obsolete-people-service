declare module 'people-ng-service' {


    export interface IService {
        request:                    (query : PeopleProtocol.Request) => ng.IPromise<PeopleProtocol.Response>;
    }

    export function service($rootScope, $q, $http) : IService;
}
