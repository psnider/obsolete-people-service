declare module 'people-ng-service' {

    import Database = require('document-database-if')


    export interface IService {
        request: (query : Database.Request<Person.Person>) => ng.IPromise<Database.Response<Person.Person>>;
    }

    export function service($rootScope, $q, $http) : IService;
}
