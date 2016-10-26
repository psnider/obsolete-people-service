//import {MongooseDataDefinition} from "../../../../typings/people-service/shared/mongoose-data-type"


type MongooseDataDefinitionFunction = (...any) => any
type MongooseDataDefinitionType = MongooseDataDefinitionFunction | MongooseDataDefinitionFunction[] | MongooseDataDefinition | MongooseDataDefinition[]
type MongooseDataDefinition = {[fieldname:string]: MongooseDataDefinitionType}

var PERSON_NAME_SCHEMA_DEF: MongooseDataDefinition = {
    family: String,
    given: String,
    additional: String
};


// no primary ID, this entire document is the ID
var CONTACT_METHOD_SCHEMA_DEF: MongooseDataDefinition = {
    method: String,
    address: String,
    display_name: String
};


var LOCATION_SCHEMA_DEF: MongooseDataDefinition = {
    lat: Number,
    lng: Number,
    when: Date
};


var PERSON_SCHEMA_DEF: MongooseDataDefinition = {
    _test_only: Boolean,
    account_email: String,
    account_status: String,
    name: PERSON_NAME_SCHEMA_DEF,
    locale: String,
    time_zone: String,
    role: String,
    contact_methods: [CONTACT_METHOD_SCHEMA_DEF],
    last_known_loc: LOCATION_SCHEMA_DEF,
    profile_pic_urls: [String]   // URL
};


//var PERSON_SCHEMA = new mongoose.Schema(PERSON_SCHEMA_DEF);

// TODO: restore indexing based on email, once it's been added to the browser UI
//PERSON_SCHEMA.index({ account_email: 1}, { unique: true });
//PERSON_SCHEMA.set('autoIndex', false);


// var PersonModel = mongoose.model('Person', PERSON_SCHEMA);
// PersonModel.ensureIndexes(function (error) {
//     if (error) {
//         throw error;
//     }
// });


export {
    PERSON_NAME_SCHEMA_DEF,
    CONTACT_METHOD_SCHEMA_DEF,
    PERSON_SCHEMA_DEF
};
