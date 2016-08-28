declare module PeopleProtocol {

    interface Request {
        // create, read, update, delete, search
        action: string;
        person?: Person.Person;
    }


    interface Response {
        person?: Person.Person;
        error?:    any;
    }

}
