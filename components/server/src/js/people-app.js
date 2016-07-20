/// <reference path='../../typings/node/node.d.ts' />
var configure = require('configure-local')
var express = require('express')

var CONFIG = configure.get('seneca')

var seneca = require('seneca')(CONFIG)
seneca.use('seneca-entity')
seneca.use('../../../generated/commonjs/people-api')
seneca.client({type:'tcp', pin:'role:people'})


var app = express()
app.use(require('body-parser').json())
app.use(seneca.export('web'))
app.listen(configure.get('people:port'))
