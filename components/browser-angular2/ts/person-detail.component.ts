import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Person } from './person';
import { PeopleService } from './people.service';

@Component({
  selector: 'my-person-detail',
  templateUrl: 'app/person-detail.component.html',
  styleUrls: ['app/person-detail.component.css']
})
export class PersonDetailComponent implements OnInit, OnDestroy {
  @Input() person: Person;
  @Output() close = new EventEmitter();
  error: any;
  sub: any;
  navigated = false; // true if navigated here


  constructor(
    private peopleService: PeopleService,
    private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      if (params['id'] !== undefined) {
        let id = +params['id'];
        this.navigated = true;
        this.peopleService.getPerson(id)
            .then(person => this.person = person);
      } else {
        this.navigated = false;
        this.person = new Person();
      }
    });
  }

  save() {
    this.peopleService
        .save(this.person)
        .then(person => {
          this.person = person; // saved person, w/ id if new
          this.goBack(person);
        })
        .catch(error => this.error = error); // TODO: Display error message
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goBack(savedPerson: Person = null) {
    this.close.emit(savedPerson);
    if (this.navigated) { window.history.back(); }
  }

}
