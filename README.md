[![NPM version](http://img.shields.io/npm/v/people-service.svg)](https://www.npmjs.org/package/people-service)
[![Dependencies](https://david-dm.org/psnider/people-service.svg)](https://www.npmjs.org/package/people-service)





# A People Micro-Service based on Seneca

This is a work in progress, as I try to learn and use seneca.  
I chose seneca because it separates the business logic from database and transport,
making it easier to test, maintain, and configure.

I'm building a non-trivial People micro-service that:
- [x] uses the seneca micro-service framework on the server
- [x] uses an angular.js service on the client
- [x] uses best-practices testing for server, client, and end-to-end
- [ ] has a simple web UI using angular.js
- [ ] stores its data in mongodb  

I'm working on the angular UI next...
and all comments are welcome!

## People Service

The main server logic is in the *seneca* plugin [src/ts/people-plugin.ts](src/ts/people-plugin.ts), which is contained in the People service.

The People service consists of three parts:  
- A People service  .
This takes a JSON request, looks up a Person from their ID, and returns it.
- A seneca adaptor for an in-memory database (seneca-mem-store).
- A Web API proxy for the People service  
This takes a JSON request from an external source, and passes a sanitized JSON request to the internal people service.

**Here's a sequence diagram showing how this fits into the system:**
![Sequence Diagram](doc/sequence_diagram.jpg)

## Setup for Build
```
make setup
```

## Build All Software
```
make build
```

## Test
The following make commands run different tests:

- ```make test-server```  
Tests the server internals standalone using mocha.
- ```make test-client```  
Tests the angular.js client in a Chrome browser using mocha and karma.
- ```make test-end-to-end```  
Tests the server from a Chrome browser using mocha and protractor with selenium.  
Note that the *end-to-end* tests require that you run ```webdriver-manager start``` before running the tests.


## Build and Run All Tests
```
make
```


# Run the Service and Web API Server
In a command shell, run:
```
bin/start-servers.sh --log
```
This will start both servers in the same shell, with plugin logging.  
Note that both logs will be combined on the console.  
If you want to save the logs to a file in the *log* directory, add the **--save** flag.

# Stop the Service and Web API Server
In a command shell, run:
```
bin/stop-servers.sh
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

Use **curl** to delete a *Person* record and then confirm that read no longer returns that *Person*
```
curl -H "Content-Type: application/json" -X POST -d '{"action":"delete", "person":{"id":"abcdef"}}' http://localhost:3000/api/people
curl -H "Content-Type: application/json" -X POST -d '{"action":"read", "person":{"id":"abcdef"}}' http://localhost:3000/api/people
```


# Support
If you have any questions, suggestions, or problems,
please email me at my address given on npm, or file an issue.
