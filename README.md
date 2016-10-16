[![NPM version](http://img.shields.io/npm/v/people-service.svg)](https://www.npmjs.org/package/people-service)
[![Dependencies](https://david-dm.org/psnider/people-service.svg)](https://www.npmjs.org/package/people-service)




# A People Micro-Service based on Node.js, Angular2, and NativeScript

- TypeScript v2.0.0
- node.js v5.12.0
- angular2 v2.0.0-rc.5
- NativeScript v2.1.1


This is a work in progress. All comments are welcome!  
Once this template is finished,
it should be easily modified to make a new service.

This micro-service:
- [x] Uses TypeScript for the server, the browser, and for mobile  
making it easier to configure.
- [x] Uses best-practices testing for server, client, and end-to-end.  
Uses mocha for the server, karma for the client, and protractor for end-to-end.  
:warning: karma for angular2 is broken as of v2.0.0-rc.5 and rc.6  
See [karma support will be added to quickstart](https://github.com/angular/quickstart/issues/208#issuecomment-245654108)  
and get help from [Karma Gitter](https://gitter.im/karma-runner/karma)
- [x] has a simple web UI using Angular2
- [x] Uses npm scripts for (automated) building and testing.  
*We used to use gulp, but it added a level of indirection, and still required much more work than the npm scripts that we use now.*
- [x] Uses the express micro-service framework on the server.  
- [x] has a [mobile-app in NativeScript](https://github.com/psnider/people-mobile) for Android and iOS
- [x] stores its data in mongodb.  
- [ ] automates deployment.  
*mongodb* is schema-less, and easy for development.


## People Service

The People service consists of three parts:  
- A People API service  
This takes a JSON request, looks up a Person from their ID, and returns it.
- A Web service for users to view and edit their personal data  
- A Web service for administrators to view and edit anyone's data  

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

Use **curl** to create a *Person* record:
```
curl -H "Content-Type: application/json" -X POST -d '{"action":"create", "obj":{"name":{"given":"Sally","family":"Smith"}}}' http://localhost:3000/api/people
```
This command will return the created Person record, with its *_id*.
Use this *_id* for your subsequent queries. In the examples below, the id was *5803c7396dc69c29557c92a5*.

Use **curl** to read a *Person*
```
curl -H "Content-Type: application/json" -X POST -d '{"action":"read", "query":{"ids":["5803c7396dc69c29557c92a5"]}}' http://localhost:3000/api/people
```

Use **curl** to update a *Person* and then read back the updated *Person*
```
curl -H "Content-Type: application/json" -X POST -d '{"action":"update","query":{"conditions":{"_id":"5803c7396dc69c29557c92a5"}},"updates":[{"cmd":"set","field":"name.given","value":"Joe"}]}' http://localhost:3000/api/people
```

    let _id = msg.query && (msg.query.ids && msg.query.ids[0])


Use **curl** to delete a *Person* record and then confirm that read no longer returns that *Person*
```
curl -H "Content-Type: application/json" -X POST -d '{"action":"delete", "query":{"ids":["5803c7396dc69c29557c92a5"]}}' http://localhost:3000/api/people
curl -H "Content-Type: application/json" -X POST -d '{"action":"read", "query":{"ids":["5803c7396dc69c29557c92a5"]}}' http://localhost:3000/api/people
```

Use **curl** to find all of the *Person* records.
```
curl -H "Content-Type: application/json" -X POST -d '{"action":"find", "query":{"conditions":{}}}' http://localhost:3000/api/people
```

# Exercise the Client
For now, it looks pretty much like the Angular2 Tour-of-Heroes tutorial:
```
http://localhost:3000
```

# Support
If you have any questions, suggestions, or problems,
please email me at my address given on npm, or file an issue.
