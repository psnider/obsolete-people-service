import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { Observable }        from 'rxjs/Observable';
import { Subject }           from 'rxjs/Subject';
import { PeopleSearchService } from './people-search.service';

@Component({
  selector: 'people-search',
  templateUrl: 'people-app/people-search.component.html',
  styleUrls:  ['people-app/people-search.component.css'],
  providers: [PeopleSearchService]
})
export class PeopleSearchComponent implements OnInit {
  people: Observable<Person.Person[]>;
  private searchTerms = new Subject<string>();
  constructor(
    private peopleSearchService: PeopleSearchService,
    private router: Router) {}
  // Push a search term into the observable stream.
  search(term: string) { this.searchTerms.next(term); }
  ngOnInit() {
    this.people = this.searchTerms
      .debounceTime(300)        // wait for 300ms pause in events
      .distinctUntilChanged()   // ignore if next search term is same as previous
      .switchMap(term => term   // switch to new observable each time
        // return the http search observable
        ? this.peopleSearchService.search(term)
        // or the observable of empty people if no search term
        : Observable.of<Person.Person[]>([]))
      .catch(error => {
        // TODO: real error handling
        console.log(error);
        return Observable.of<Person.Person[]>([]);
      });
  }
  gotoDetail(person: Person.Person) {
    let link = ['/detail', person.id];
    this.router.navigate(link);
  }
}

