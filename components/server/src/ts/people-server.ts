import body_parser = require('body-parser');
import express = require('express')
import pino = require('pino')

import configure = require('configure-local')
import people_handler = require('./people-handler')


var VERSION = '0.0.1'


var log = pino({name: 'people', enabled: !process.env.DISABLE_LOGGING})


function exit(err) {
    // handle the error safely
    log.info('======== EXITING ========')
    log.error(err)
    // TODO: safely shut-down other services
    process.exit(1)
}


process.on('uncaughtException', exit)
process.on('SIGINT', () => {exit(new Error('Received SIGINT'))});
process.on('SIGTERM', () => {exit(new Error('Received SIGTERM'))});


// TODO: remove
declare function handlePeople()


log.info({version: VERSION})


const CONFIG = configure.get('XYZ')


var app = express()
people_handler.configureExpress(app)
const port = configure.get('people:port')
app.listen(port)

