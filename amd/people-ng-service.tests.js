/// <reference path='../../../../typings/angularjs/angular.d.ts' />
/// <reference path='../../../../typings/angularjs/angular-mocks.d.ts' />
/// <reference path='../../../../typings/mocha/mocha.d.ts' />
/// <reference path='../../../../typings/chai/chai.d.ts' />
/// <reference path='../../../../typings/people-service/people-ng-service.d.ts' />
define(["require", "exports", 'angular', 'angular-mocks/ngMockE2E', 'chai', 'people-ng-service'], function (require, exports, angular, mocks, chai, People) {
    if (mocks != null)
        console.log('need to reference mocks so it is imported');
    var expect = chai.expect;
    describe('people-ng-service', function () {
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
                    httpBackend.expect('POST', 'http://localhost:3000/api/people').respond(200, { person: { id: 'test-query', name: { given: 'Bob' } } });
                    var person, error;
                    var request = { action: 'read', person: { id: 'test-query' } };
                    var promise = service.request(request);
                    promise.then(function (response) {
                        person = response.person;
                    }, function (response) {
                        error = response.error;
                    });
                    httpBackend.flush();
                    expect(error).to.be.undefined;
                    expect(person).to.deep.equal({ id: 'test-query', name: { given: 'Bob' } });
                    httpBackend.verifyNoOutstandingExpectation();
                    httpBackend.verifyNoOutstandingRequest();
                    httpBackend.resetExpectations();
                });
                it('+ should convert JSON fields to Date type', function () {
                    var RESPONSE = { person: { id: 'test-convert-to-Date', name: { given: 'Bob' }, last_known_loc: { lat: 34, lng: -122, when: "2015-03-25T12:01:02.003" } } };
                    httpBackend.expect('POST', 'http://localhost:3000/api/people').respond(200, RESPONSE);
                    var person, error;
                    var request = { action: 'read', person: { id: 'test-convert-to-Date' } };
                    var promise = service.request(request);
                    promise.then(function (response) {
                        person = response.person;
                    }, function (response) {
                        error = response.error;
                    });
                    httpBackend.flush();
                    expect(person.last_known_loc.when instanceof Date).to.be.true;
                    var when_as_Date = new Date(RESPONSE.person.last_known_loc.when);
                    expect(person.last_known_loc.when.getTime()).to.equal(when_as_Date.getTime());
                    httpBackend.verifyNoOutstandingExpectation();
                    httpBackend.verifyNoOutstandingRequest();
                    httpBackend.resetExpectations();
                });
            });
        });
    });
});
