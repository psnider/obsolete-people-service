import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
import { Person }           from './person';
@Injectable()
export class PeopleSearchService {
  constructor(private http: Http) {}
  search(term: string) {
    return this.http
               .get(`app/people/?name=${term}`)
               .map((r: Response) => r.json().data as Person[]);
  }
}
