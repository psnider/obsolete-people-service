/// <reference path='../../../typings/angularjs/angular.d.ts' />
/// <reference path='../../../typings/bunyan/bunyan.d.ts' />
/// <reference path='../../../typings/es6-promise/es6-promise.d.ts' />
/// <reference path='../../../typings/people-service/Person.d.ts' />
/// <reference path='../../../typings/people-service/people-protocol.d.ts' />


//----------- CLIENT only code -----------------
//
import Person = require('Person')

//const Config      = require('./config/config.json');
const Config = {
    "people": {
        "service_url": "http://localhost:3000/api/people"
    }
}

const SERVICE_URL = Config.people.service_url;



export function service($rootScope, $q, $http) {
    console.log('People.service started');


    function remoteRequest(request: PeopleProtocol.Request) : ng.IPromise<PeopleProtocol.Response> {
        console.log('people-service.remoteRequest request=' + JSON.stringify(request));
        var deferred = $q.defer();
        // wrap the HTTP promise so we can convert time strings from the JSON response back into Date objects
        var config = {method: 'POST', url: SERVICE_URL, data: request};
        $http(config).then(
            (res) => {
console.log('people-service.remoteRequest resolved');
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
