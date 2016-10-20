import mongoose                         = require('mongoose');
import {Person} from '../shared/person.d'

export var PERSON_NAME_SCHEMA_DEF : any;
export var CONTACT_METHOD_SCHEMA_DEF : any;
export var PERSON_SCHEMA_DEF : any;
export var PERSON_SCHEMA : mongoose.Schema;
export type PersonDocument = Person & mongoose.Document

export var PersonModel : mongoose.Model<PersonDocument>;
