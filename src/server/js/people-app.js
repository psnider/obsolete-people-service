/// <reference path='../../typings/node/node.d.ts' />
var configure = require('configure-local')
var express = require('express')

var CONFIG = configure.get('seneca')

var seneca = require('seneca')(CONFIG)
      .use('../../../generated/commonjs/people-api')
      .client({type:'tcp', pin:'role:people'})


var app = express()
      .use(require('body-parser').json())
      .use(seneca.export('web'))
      .use('/people', express.static('src/client/html'))
      .use('/people/script', express.static('amd'))
      .use('/people/script', express.static('lib'))
      .listen(configure.get('people:port'))
