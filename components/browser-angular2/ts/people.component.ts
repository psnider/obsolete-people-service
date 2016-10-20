import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import {Person} from '../../../typings/people-service/shared/person'
import { PeopleService }         from './people.service';
import { PersonDetailComponent } from './person-detail.component';
@Component({
  selector: 'my-people',
  templateUrl: 'people-app/people.component.html',
  styleUrls:  ['people-app/people.component.css']
})
export class PeopleComponent implements OnInit {
  people: Person[];
  selectedPerson: Person;
  addingPerson = false;
  error: any;
  constructor(
    private router: Router,
    private peopleService: PeopleService) { }
  getPeople(): void {
    this.peopleService
        .getPeople()
        .then(people => this.people = people)
        .catch(error => this.error = error);
  }
  addPerson(): void {
    this.addingPerson = true;
    this.selectedPerson = null;
  }
  close(savedPerson: Person): void {
    this.addingPerson = false;
    if (savedPerson) { this.getPeople(); }
  }
  deletePerson(person: Person, event: any) {
    event.stopPropagation();
    this.peopleService
        .delete(person)
        .then(res => {
          this.people = this.people.filter(h => h !== person);
          if (this.selectedPerson === person) { this.selectedPerson = null; }
        })
        .catch(error => this.error = error);
  }
  ngOnInit() {
    this.getPeople();
  }
  onSelect(person: Person) {
    this.selectedPerson = person;
    this.addingPerson = false;
  }
  gotoDetail() {
    this.router.navigate(['/detail', this.selectedPerson._id]);
  }
}
