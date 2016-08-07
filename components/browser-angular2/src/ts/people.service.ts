import { Injectable } from 'angular2/core';

import { Person } from './person';
import { PEOPLE } from './mock-people';

@Injectable()
export class PeopleService {
  getPeople() {
    return Promise.resolve(PEOPLE);
  }

  getPeopleSlowly() {
    return new Promise<Person[]>(resolve =>
      setTimeout(()=>resolve(PEOPLE), 2000) // 2 seconds
    );
  }

  getPerson(id: number) {
    return Promise.resolve(PEOPLE).then(
      (people: Person[]) => people.filter(person => person.id === id)[0]
    );
  }
}
