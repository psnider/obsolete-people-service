[![NPM version](http://img.shields.io/npm/v/people-service.svg)](https://www.npmjs.org/package/people-service)
[![Dependencies](https://david-dm.org/psnider/people-service.svg)](https://www.npmjs.org/package/people-service)

:warning: This uses seneca.js, v2.1.0, which as of Jul 20, 2016, does not work with node v6.  Angular2 requires at least node v5, so we use v5.  See the [setup notes](https://github.com/psnider/setup-mean-ts#install-nodejs-and-npm) for how to install v5.



# A People Micro-Service based on Seneca

This is a work in progress. All comments are welcome!  
Once this template is finished,
it should be easily modified to make a new service.

This micro-service:
- [x] Uses TypeScript for both front-end and back-end code.  
- [x] Uses npm scripts for (automated) building and testing.  
*We used to use gulp, but it added a level of indirection, and still required much more work than the npm scripts that we use now.*
- [x] Uses the seneca micro-service framework on the server.  
*seneca* separates the business logic from databases and transports,
making it easier to test, maintain, and configure.
- [x] Uses Angular2 on the client.  
*Angular* is the most popular SPA framework.  Angular2 is in beta.
- [x] Uses best-practices testing for server, client, and end-to-end.  
Uses mocha for the server, karma for the client, and protractor for end-to-end.
- [x] has a simple web UI using Angular2
- [x] has a [mobile-app in NativeScript](https://github.com/psnider/people-mobile) for Android and iOS
- [ ] stores its data in mongodb.  
*mongodb* is schema-less, and easy for development.


## People Service

The main server logic is in the *seneca* plugin [src/server/ts/people-plugin.ts](src/server/ts/people-plugin.ts), which is contained in the People service.

The People service consists of three parts:  
- A People API service  
This takes a JSON request, looks up a Person from their ID, and returns it.
- A seneca adaptor for an in-memory database (seneca-mem-store).
- A Web API proxy for the People API service  
This takes a JSON request from an external source, and passes a sanitized JSON request to the internal people service.

**Here's a sequence diagram showing how this fits into the system:**
![Sequence Diagram](doc/sequence_diagram.jpg)

## Setup for Build
This will take about 3 minutes:
```
npm install
```


## Build
Build all of the software:  
```
npm run build
```

Build a sub-project:  
```
npm run build-browser-angular2
npm run build-server
```

## Test
Build and test all of the software:  
```
npm run test
```

Build and test a sub-project:  
- Test the server internals standalone using mocha.  
```
npm run test-server
```  
- Test the angular.js client in a Chrome browser using jasmine and karma.  
```
npm run test-browser-angular2
```  
- Test the server from a Chrome browser using protractor with selenium.  
```
npm run test-end-to-end-live
```  


# Run the Service and Web API Server
```
npm run start-servers
```
This will start both servers in the same shell, with plugin logging.  
Note that both logs will be written to the *./logs* directory.

# Stop the Service and Web API Server
```
npm run stop-servers
```

## Exercise the Service

Note that these commands are similar to the ones in the automated end-to-end tests.

Use **curl** to create some *Person* records:
```
curl -H "Content-Type: application/json" -X POST -d '{"action":"create", "person":{"name":{"given":"Sally","family":"Smith"}}}' http://localhost:3000/api/people
curl -H "Content-Type: application/json" -X POST -d '{"action":"create", "person":{"name":{"given":"Bob","family":"Brown"}}}' http://localhost:3000/api/people
```
These commands will return the created Person records, with their IDs.
Use these IDs for your subsequent queries. In the examples below, the id was *abcdef*.

Use **curl** to read a *Person*
```
curl -H "Content-Type: application/json" -X POST -d '{"action":"read", "person":{"id":"abcdef"}}' http://localhost:3000/api/people
```

Use **curl** to update a *Person* and then read back the updated *Person*
```
curl -H "Content-Type: application/json" -X POST -d '{"action":"update", "person":{"id":"abcdef", "shoe_size": 8}}' http://localhost:3000/api/people
curl -H "Content-Type: application/json" -X POST -d '{"action":"read", "person":{"id":"abcdef"}}' http://localhost:3000/api/people
```


Use **curl** to delete a *Person* record and then confirm that read no longer returns that *Person*
```
curl -H "Content-Type: application/json" -X POST -d '{"action":"delete", "person":{"id":"abcdef"}}' http://localhost:3000/api/people
curl -H "Content-Type: application/json" -X POST -d '{"action":"read", "person":{"id":"abcdef"}}' http://localhost:3000/api/people
```

# Exercise the Client
For now, you just check that the page loads without error (use your browser's debugger):
```
http://localhost:3000/people/app.html
```
# Support
If you have any questions, suggestions, or problems,
please email me at my address given on npm, or file an issue.
