import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Person } from './person';
import { PeopleService } from './people.service';
import { PeopleSearchComponent } from './people-search.component';

@Component({
  selector: 'my-dashboard',
  templateUrl: 'people-app/dashboard.component.html',
  styleUrls: ['people-app/dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  people: Person[] = [];
  constructor(
    private router: Router,
    private personService: PeopleService) {
  }
  ngOnInit() {
    this.personService.getPeople()
      .then(people => this.people = people.slice(1, 5));
  }
  gotoDetail(person: Person) {
    let link = ['/detail', person.id];
    this.router.navigate(link);
  }
}
