import { Component, Input, OnInit } from 'angular2/core';
import { RouteParams } from 'angular2/router';

import { Person } from './person';
import { PeopleService } from './people.service';

@Component({
  selector: 'my-person-detail',
  templateUrl: 'html/person-detail.component.html',
  styleUrls: ['html/person-detail.component.css']
})
export class PersonDetailComponent implements OnInit {
  @Input() person: Person;

  constructor(
    private _peopleService: PeopleService,
    private _routeParams: RouteParams) {
  }

  ngOnInit() {
    let id = +this._routeParams.get('id');
    this._peopleService.getPerson(id)
      .then((person: Person) => this.person = person);
  }

  goBack() {
    window.history.back();
  }
}
