// DATA CONFIGURATION: export the TypeScript type (as DataType) that describes your data type for the micro-service
export {Person as DataType} from '../../../../typings/people-service/shared/person'
// DATA CONFIGURATION: export the mongoose data model (as DataModel) that describes your data type for the micro-service
export {PersonModel as DataModel} from './person.mongoose-schema'
    // the name of the server configuration field (suitable for configure-local)
export var SERVER_CONFIG_FIELDNAME = 'people'
