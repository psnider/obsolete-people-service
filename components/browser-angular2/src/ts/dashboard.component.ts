import { Component, OnInit } from 'angular2/core';
import { Router } from 'angular2/router';

import { Person } from './person';
import { PeopleService } from './people.service';

@Component({
  selector: 'my-dashboard',
  templateUrl: 'html/dashboard.component.html',
  styleUrls: ['html/dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  people: Person[] = [];

  constructor(
    private _router: Router,
    private _peopleService: PeopleService) {
  }

  ngOnInit() {
    this._peopleService.getPeople()
      .then((people: Person[]) => this.people = people.slice(1,5));
  }

  gotoDetail(person: Person) {
    let link = ['PersonDetail', { id: person.id }];
    this._router.navigate(link);
  }
}
