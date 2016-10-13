declare module 'Person_mongoose' {

    import mongoose                         = require('mongoose');
    import Person_mod                       = require('Person');

    export var PERSON_NAME_SCHEMA_DEF : any;
    export var CONTACT_METHOD_SCHEMA_DEF : any;
    export var PERSON_SCHEMA_DEF : any;
    export var PERSON_SCHEMA : mongoose.Schema;
    export type PersonDocument = Person_mod.Person & mongoose.Document

    export var PersonModel : mongoose.Model<PersonDocument>;

}
