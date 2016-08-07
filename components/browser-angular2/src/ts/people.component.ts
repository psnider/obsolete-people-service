import { Component, OnInit } from 'angular2/core';
import { Router } from 'angular2/router';

import { Person } from './person';
import { PersonDetailComponent } from './person-detail.component';
import { PeopleService } from './people.service';

@Component({
  selector: 'my-people',
  templateUrl: 'html/people.component.html',
  styleUrls:  ['html/people.component.css'],
  directives: [PersonDetailComponent]
})
export class PeopleComponent implements OnInit {
  people: Person[];
  selectedPerson: Person;

  constructor(
    private _router: Router,
    private _peopleService: PeopleService) { }

  getPeople() {
    this._peopleService.getPeople().then(people => this.people = people);
  }

  ngOnInit() {
    this.getPeople();
  }

  onSelect(person: Person) { this.selectedPerson = person; }

  gotoDetail() {
    this._router.navigate(['PersonDetail', { id: this.selectedPerson.id }]);
  }
}
