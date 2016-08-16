import { Component, OnInit } from '@angular/core';
import { Person } from './person';
import { PersonDetailComponent } from './person-detail.component';
import { PeopleService } from './people.service';
@Component({
  selector: 'my-app',
  template: `
    <h1>{{title}}</h1>
    <h2>My People</h2>
    <ul class="people">
      <li *ngFor="let person of people"
        [class.selected]="person === selectedPerson"
        (click)="onSelect(person)">
        <span class="badge">{{person.id}}</span> {{person.name}}
      </li>
    </ul>
    <my-person-detail [person]="selectedPerson"></my-person-detail>
  `,
  styles: [`
    .selected {
      background-color: #CFD8DC !important;
      color: white;
    }
    .people {
      margin: 0 0 2em 0;
      list-style-type: none;
      padding: 0;
      width: 15em;
    }
    .people li {
      cursor: pointer;
      position: relative;
      left: 0;
      background-color: #EEE;
      margin: .5em;
      padding: .3em 0;
      height: 1.6em;
      border-radius: 4px;
    }
    .people li.selected:hover {
      background-color: #BBD8DC !important;
      color: white;
    }
    .people li:hover {
      color: #607D8B;
      background-color: #DDD;
      left: .1em;
    }
    .people .text {
      position: relative;
      top: -3px;
    }
    .people .badge {
      display: inline-block;
      font-size: small;
      color: white;
      padding: 0.8em 0.7em 0 0.7em;
      background-color: #607D8B;
      line-height: 1em;
      position: relative;
      left: -1px;
      top: -4px;
      height: 1.8em;
      margin-right: .8em;
      border-radius: 4px 0 0 4px;
    }
  `],
  directives: [PersonDetailComponent],
  providers: [PeopleService]
})
export class AppComponent implements OnInit {
  title = 'people-service title';
  people: Person[];
  selectedPerson: Person;
  constructor(private peopleService: PeopleService) { }
  getPeople() {
    this.peopleService.getPeople().then(people => this.people = people);
  }
  ngOnInit() {
    this.getPeople();
  }
  onSelect(person: Person) { this.selectedPerson = person; }
}
