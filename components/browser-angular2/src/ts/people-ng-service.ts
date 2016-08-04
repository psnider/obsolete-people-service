/// <reference path="../../../../typings/browser.d.ts" />


//----------- CLIENT only code -----------------
//
import Person = require('Person')


const SERVICE_URL = '/api/people'



export function service($rootScope, $q, $http) {
    console.log('People.service started');


    function remoteRequest(request: PeopleProtocol.Request) : ng.IPromise<PeopleProtocol.Response> {
        var deferred = $q.defer();
        // wrap the HTTP promise so we can convert time strings from the JSON response back into Date objects
        var config = {method: 'POST', url: SERVICE_URL, data: request};
        $http(config).then(
            (res) => {
                var response : PeopleProtocol.Response = res.data;
                if ('person' in response) {
                    Person.convertJSONToObject(response.person);
                }
                deferred.resolve(response)
            },
            (error) => {
                deferred.reject(error)
            }
        );
        return deferred.promise;
    }


    var svc = {
        request: remoteRequest
    };


    return svc;
}
