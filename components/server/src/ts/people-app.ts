import configure = require('configure-local')
import express = require('express')

var CONFIG = configure.get('seneca')

//import SENECA = require('seneca')
import * as SENECA from 'seneca'
var seneca = SENECA(CONFIG)
// seneca-entity is only required until seneca v3.0, after which a bug in transport should be fixed, no longer requiring the entity plugin
seneca.use('seneca-entity')
seneca.use('people-api')
seneca.client({type:'tcp', pin:'role:people'})


var app = express()
app.use(require('body-parser').json())
app.use(seneca.export('web'))
app.listen(configure.get('people:port'))
