System.register(['angular2/core', './mock-people'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, mock_people_1;
    var PeopleService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (mock_people_1_1) {
                mock_people_1 = mock_people_1_1;
            }],
        execute: function() {
            PeopleService = (function () {
                function PeopleService() {
                }
                PeopleService.prototype.getPeople = function () {
                    return Promise.resolve(mock_people_1.PEOPLE);
                };
                PeopleService.prototype.getPeopleSlowly = function () {
                    return new Promise(function (resolve) {
                        return setTimeout(function () { return resolve(mock_people_1.PEOPLE); }, 2000);
                    } // 2 seconds
                     // 2 seconds
                    );
                };
                PeopleService.prototype.getPerson = function (id) {
                    return Promise.resolve(mock_people_1.PEOPLE).then(function (people) { return people.filter(function (person) { return person.id === id; })[0]; });
                };
                PeopleService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [])
                ], PeopleService);
                return PeopleService;
            }());
            exports_1("PeopleService", PeopleService);
        }
    }
});
//# sourceMappingURL=people.service.js.map