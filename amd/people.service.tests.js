/// <reference path='../../../../typings/angularjs/angular.d.ts' />
/// <reference path='../../../../typings/angularjs/angular-mocks.d.ts' />
/// <reference path='../../../../typings/mocha/mocha.d.ts' />
/// <reference path='../../../../typings/chai/chai.d.ts' />
/// <reference path='../../../../typings/people-service/people.service.d.ts' />
define(["require", "exports", 'angular', 'angular-mocks/ngMockE2E', 'chai', 'people-service'], function (require, exports, angular, mocks, chai, People) {
    if (mocks != null)
        console.log('need to reference mocks so it is imported');
    var expect = chai.expect;
    describe('people-service', function () {
        // Create a dummy app for testing
        var app = angular.module('test-people', ['ngMockE2E']);
        app.factory('PeopleService', ['$rootScope', '$q', '$http', People.service]);
        beforeEach(angular.mock.module('test-people'));
        describe('service', function () {
            var service;
            var httpBackend;
            it('init tests', inject(function (PeopleService, $http, $q, $httpBackend) {
                expect(PeopleService).to.not.be.undefined;
                service = PeopleService;
                httpBackend = $httpBackend;
            }));
            describe('request', function () {
                it('+ should query server', function () {
                    httpBackend.expect('POST', 'http://localhost:3000/api/people').respond(200, { person: { id: 'abcdef', name: { given: 'Bob' } } });
                    var person, error;
                    var query = { action: 'read', person: { id: 'abcdef' } };
                    var promise = service.request(query);
                    promise.then(function (response) {
                        person = response.person;
                    }, function (response) {
                        error = response.error;
                    });
                    httpBackend.flush();
                    expect(error).to.be.undefined;
                    expect(person).to.deep.equal({ id: 'abcdef', name: { given: 'Bob' } });
                    httpBackend.verifyNoOutstandingExpectation();
                    httpBackend.verifyNoOutstandingRequest();
                    httpBackend.resetExpectations();
                });
            });
        });
    });
});
