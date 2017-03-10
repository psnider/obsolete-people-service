import { Injectable }        from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {Action, Request as DBRequest, Response as DBResponse} from '@sabbatical/generic-data-server'
import {Person} from '../../../local-typings/people-service/shared/person'

@Injectable()
export class PeopleService {
    private peopleUrl = 'api/people';    // TODO: CONFIG: URL to web api
    constructor(private http: Http) { }
    getPeople(): Promise<Person[]> {
        return this.post({action: 'find', query: {conditions: {}}})
            .then((people: Person[]) => {
                console.log(`people=${JSON.stringify(people)}`)
                // TODO: fix person vs. people
                return people as Person[]
            })
            .catch(this.handleError);
    }
    getPerson(_id: string): Promise<Person> {
        return this.post({action: 'read', query: {_id}})
            .then((person: Person) => {
                // TODO: fix person vs. people
                return person as Person
            })
            .catch(this.handleError);
    }
    save(person: Person): Promise<Person>    {
        const action: Action = (person._id) ? 'replace' : 'create'
        return this.post({action, obj: person})
            .then((person: Person) => {
                // TODO: fix person vs. people
                return person as Person
            })
            .catch(this.handleError);
    }
    
    delete(person: Person): Promise<void> {
        return this.post({action: 'delete', query: {_id: person._id}})
            .then((empty: any) => {
                return empty
            })
            .catch(this.handleError);
    }

    // post people request to server 
    private post(request: DBRequest): Promise<Person | Person[]> {
        let headers = new Headers({'Content-Type': 'application/json'});
        return this.http
            .post(this.peopleUrl, JSON.stringify(request), {headers: headers})
            .toPromise()
            .then((res) => {
                let msg: DBResponse = res.json()
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
