// The configuration accepted by people-service micro-service
export interface MicroServiceConfig {
    // the name of the service, e.g. people
    service_name: string
    // the name of the database table used with this service, e.g. people
    database_table_name: string
    // the name of the type of the data for this service, e.g. Person
    typename: string
    // The hostname for the service, e.g. localhost
    hostname: string
    // The port for the api service, e.g. 3000
    api_port: number
    // The name of the user that runs the deployed service, e.g. 'people'
    app_user?: string
    // The prefix of the path portion of the URL for the service, e.g. 'api/people'
    api_url_path_prefix: string
    // The URL for the service API, e.g. 'http://localhost:3000/api/people'
    api_url: string
    // See https://www.npmjs.com/package/body-parser#limit, e.g. '5mb'
    body_parser_limit: string
    // Configuration for the database used by the service
    db: DatabaseConfig
    // Separate configuration for a test instance of the service and database,
    // suitable for running the test suites without affecting a running production service and database.
    test: {
        // The hostname is the same as that of the service
        // The port may not be the same as that of the service, e.g. 2999
        api_port: 2999,
        // e.g. http://localhost:2999/api/people,
        api_url: string
        db: DatabaseConfig
    }
}


export interface DatabaseConfig {
    // The database to use for this service instance
    type: 'MongoDBAdaptor' | 'InMemoryDB'
    // The port for the database.
    // e.g. 27017 for a persistent mongodb
    //      27106 for a temporary mongodb for a test instance
    port: number
    // e.g. localhost:27017/test
    url: string
}
