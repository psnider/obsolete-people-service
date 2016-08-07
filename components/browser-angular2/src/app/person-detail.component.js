System.register(['angular2/core', 'angular2/router', './person', './people.service'], function(exports_1, context_1) {
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
    var core_1, router_1, person_1, people_service_1;
    var PersonDetailComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (person_1_1) {
                person_1 = person_1_1;
            },
            function (people_service_1_1) {
                people_service_1 = people_service_1_1;
            }],
        execute: function() {
            PersonDetailComponent = (function () {
                function PersonDetailComponent(_peopleService, _routeParams) {
                    this._peopleService = _peopleService;
                    this._routeParams = _routeParams;
                }
                PersonDetailComponent.prototype.ngOnInit = function () {
                    var _this = this;
                    var id = +this._routeParams.get('id');
                    this._peopleService.getPerson(id)
                        .then(function (person) { return _this.person = person; });
                };
                PersonDetailComponent.prototype.goBack = function () {
                    window.history.back();
                };
                __decorate([
                    core_1.Input(), 
                    __metadata('design:type', person_1.Person)
                ], PersonDetailComponent.prototype, "person", void 0);
                PersonDetailComponent = __decorate([
                    core_1.Component({
                        selector: 'my-person-detail',
                        templateUrl: 'html/person-detail.component.html',
                        styleUrls: ['html/person-detail.component.css']
                    }), 
                    __metadata('design:paramtypes', [people_service_1.PeopleService, router_1.RouteParams])
                ], PersonDetailComponent);
                return PersonDetailComponent;
            }());
            exports_1("PersonDetailComponent", PersonDetailComponent);
        }
    }
});
//# sourceMappingURL=person-detail.component.js.map