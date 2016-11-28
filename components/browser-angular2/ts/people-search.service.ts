import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import {Person} from '../../../local-typings/people-service/shared/person'

@Injectable()
export class PeopleSearchService {
  private peopleUrl = 'api/people';  // TODO: CONFIG: URL to web api
  constructor(private http: Http) {}
  search(term: string): Observable<Person[]> {
    term = term || ''
    var request = {action: 'find', query: {conditions: {}}}
    return this.http
               .post(this.peopleUrl, request)
               .map((r: Response) => {
                 var data = r.json().data
                 return data.filter((person: Person) => {
                    if (person.name.given && (person.name.given.indexOf(term) != -1)) {
                      return true
                    }
                    return (person.name.family && (person.name.family.indexOf(term) != -1))
                 })
                })
  }
}
