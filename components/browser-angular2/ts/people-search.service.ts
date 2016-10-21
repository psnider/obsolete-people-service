import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import {Person} from '../../../typings/people-service/shared/person'

@Injectable()
export class PeopleSearchService {
  private peopleUrl = 'api/people';  // TODO: CONFIG: URL to web api
  constructor(private http: Http) {}
  search(term: string): Observable<Person[]> {
    return this.http
               .post(this.peopleUrl, {action: 'search'})
               .map((r: Response) => {
                 return r.json() as Person[]
                });
  }
}
