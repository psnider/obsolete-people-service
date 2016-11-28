declare module 'people-ng-service' {

    import {Request as DBRequest, Response as DBResponse} from '@sabbatical/document-database'


    export interface IService {
        request: (query : DBRequest) => ng.IPromise<DBResponse>;
    }

    export function service($rootScope, $q, $http) : IService;
}
