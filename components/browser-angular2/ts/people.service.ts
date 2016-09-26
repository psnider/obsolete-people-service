import { Injectable }    from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import Database = require('document-database-if')

@Injectable()
export class PeopleService {
  private peopleUrl = 'api/people';  // URL to web api
  constructor(private http: Http) { }
  getPeople(): Promise<Person.Person[]> {
    return this.post({action: 'find'})
               .then((people) => {
                 console.log(`people=${JSON.stringify(people)}`)
                 return people as Person.Person[]
                })
               .catch(this.handleError);
  }
  getPerson(_id: string): Promise<Person.Person> {
    return this.post({action: 'read', query: {conditions: {_id}}})
               .then((person) => {
                 // TODO: fix person vs. people
                 return person as Person.Person
                })
               .catch(this.handleError);
  }
  save(person: Person.Person): Promise<Person.Person>  {
    const action: Database.Action = (person._id) ? 'replace' : 'create'
    return this.post({action, obj: person});
  }
  
  delete(person: Person.Person): Promise<Response> {
    return this.post({action: 'delete', obj: {_id: person._id}});
  }

  // post people request to server 
  private post(request: Database.Request<Person.Person>): Promise<Person.Person | Person.Person[]> {
    let headers = new Headers({'Content-Type': 'application/json'});
    return this.http
               .post(this.peopleUrl, JSON.stringify(request), {headers: headers})
               .toPromise()
               .then(res => res.json().person)
               .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
