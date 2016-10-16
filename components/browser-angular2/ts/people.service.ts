import { Injectable }        from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import Database = require('document-database-if')

@Injectable()
export class PeopleService {
    private peopleUrl = 'api/people';    // URL to web api
    constructor(private http: Http) { }
    getPeople(): Promise<Person.Person[]> {
        return this.post({action: 'find', query: {conditions: {}}})
            .then((people: Person.Person[]) => {
                console.log(`people=${JSON.stringify(people)}`)
                // TODO: fix person vs. people
                return people as Person.Person[]
            })
            .catch(this.handleError);
    }
    getPerson(_id: string): Promise<Person.Person> {
        return this.post({action: 'read', query: {ids: [_id]}})
            .then((person: Person.Person) => {
                // TODO: fix person vs. people
                return person as Person.Person
            })
            .catch(this.handleError);
    }
    save(person: Person.Person): Promise<Person.Person>    {
        const action: Database.Action = (person._id) ? 'replace' : 'create'
        return this.post({action, obj: person})
            .then((person: Person.Person) => {
                // TODO: fix person vs. people
                return person as Person.Person
            })
            .catch(this.handleError);
    }
    
    delete(person: Person.Person): Promise<void> {
        return this.post({action: 'delete', query: {ids: [person._id]}})
            .then((empty: any) => {
                return empty
            })
            .catch(this.handleError);
    }

    // post people request to server 
    private post(request: Database.Request<Person.Person>): Promise<Person.Person | Person.Person[]> {
        let headers = new Headers({'Content-Type': 'application/json'});
        return this.http
            .post(this.peopleUrl, JSON.stringify(request), {headers: headers})
            .toPromise()
            .then((res) => {
                let msg: Database.Response<Person.Person> = res.json()
                if (!msg.error) {
                    return msg.data
                } else {
                    var error = new Error(msg.error)
                    error.stack = msg['stack']
                    throw error
                }
            })
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}
