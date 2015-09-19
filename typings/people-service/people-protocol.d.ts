/// <reference path='Person.d.ts' />

//import Person               = require('Person');



declare module PeopleProtocol {

    interface Request {
        role?: string;  // used by Seneca, not part of the API
        // create, read, update, delete
        // save, load, remove, list
        action: string;
        person?: Person.Person;
    }


    interface Response {
        person?: Person.Person;
        error?:    any;
    }

}
