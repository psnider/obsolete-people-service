import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Person } from './person';
@Injectable()
export class PeopleService {
  private peopleUrl = 'app/people';  // URL to web api
  constructor(private http: Http) { }
  getPeople() {
    return this.http.get(this.peopleUrl)
               .toPromise()
               .then(response => response.json().data as Person[])
               .catch(this.handleError);
  }
  getPerson(id: number) {
    return this.getPeople()
               .then(people => people.find(person => person.id === id));
  }
  save(person: Person): Promise<Person>  {
    if (person.id) {
      return this.put(person);
    }
    return this.post(person);
  }
  delete(person: Person) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let url = `${this.peopleUrl}/${person.id}`;
    return this.http
               .delete(url, {headers: headers})
               .toPromise()
               .catch(this.handleError);
  }
  // Add new Person
  private post(person: Person): Promise<Person> {
    let headers = new Headers({
      'Content-Type': 'application/json'});
    return this.http
               .post(this.peopleUrl, JSON.stringify(person), {headers: headers})
               .toPromise()
               .then(res => res.json().data)
               .catch(this.handleError);
  }
  // Update existing Person
  private put(person: Person) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let url = `${this.peopleUrl}/${person.id}`;
    return this.http
               .put(url, JSON.stringify(person), {headers: headers})
               .toPromise()
               .then(() => person)
               .catch(this.handleError);
  }
  private handleError(error: any) {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
