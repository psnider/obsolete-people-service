declare module PeopleProtocol {

    type Action = 'create' | 'read' | 'update' | 'delete' | 'search'

    interface Request {
        // create, read, update, delete, search
        action: Action
        person?: Person.Person
        query?: DatabaseIF.ObjectQuery
    }


    interface Response {
        person?: Person.Person
        error?: any
    }

}
