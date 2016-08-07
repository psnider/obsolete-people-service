System.register(['angular2/core', 'angular2/router', './person-detail.component', './people.service'], function(exports_1, context_1) {
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
    var core_1, router_1, person_detail_component_1, people_service_1;
    var PeopleComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (person_detail_component_1_1) {
                person_detail_component_1 = person_detail_component_1_1;
            },
            function (people_service_1_1) {
                people_service_1 = people_service_1_1;
            }],
        execute: function() {
            PeopleComponent = (function () {
                function PeopleComponent(_router, _peopleService) {
                    this._router = _router;
                    this._peopleService = _peopleService;
                }
                PeopleComponent.prototype.getPeople = function () {
                    var _this = this;
                    this._peopleService.getPeople().then(function (people) { return _this.people = people; });
                };
                PeopleComponent.prototype.ngOnInit = function () {
                    this.getPeople();
                };
                PeopleComponent.prototype.onSelect = function (person) { this.selectedPerson = person; };
                PeopleComponent.prototype.gotoDetail = function () {
                    this._router.navigate(['PersonDetail', { id: this.selectedPerson.id }]);
                };
                PeopleComponent = __decorate([
                    core_1.Component({
                        selector: 'my-people',
                        templateUrl: 'html/people.component.html',
                        styleUrls: ['html/people.component.css'],
                        directives: [person_detail_component_1.PersonDetailComponent]
                    }), 
                    __metadata('design:paramtypes', [router_1.Router, people_service_1.PeopleService])
                ], PeopleComponent);
                return PeopleComponent;
            }());
            exports_1("PeopleComponent", PeopleComponent);
        }
    }
});
//# sourceMappingURL=people.component.js.map