import body_parser = require('body-parser');
import express = require('express')
import pino = require('pino')

import configure = require('configure-local')
import {MicroServiceConfig, SingleTypeDatabaseServer} from 'generic-data-server'

import {Person} from '../../../../typings/people-service/shared/person'
import {PERSON_SCHEMA_DEF} from './person.mongoose-schema'
import people_web_handler = require('./people-web-handler')


// TODO: figure out how to automatically update this from software package.
const version = '0.1.0'


var enable_logging = (process.env.DISABLE_LOGGING == null) || ((process.env.DISABLE_LOGGING.toLowerCase() !== 'true') && (process.env.DISABLE_LOGGING !== '1'))
var log = pino({name: 'people', enabled: enable_logging})


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


log.info({version})


function handleTestPage(req, res) {
    var filename = 'components/browser-angular2/html/test.html'
    res.sendFile(filename, {root: '.'})
}


const NODE_MODULES_PREFIX_LEN = '/node_modules/'.length
const ALLOWED_MODULES = [
    'core-js/client/shim.min.js', 
    'zone.js/dist/zone.js',
    'reflect-metadata/Reflect.js',
    'systemjs/dist/system.src.js',
]
function handle_node_modules(req, res) {
    console.log(`req.originalUrl=${req.originalUrl}`)
    const filename = req.originalUrl.slice(NODE_MODULES_PREFIX_LEN)
    res.sendFile(filename, {root: 'node_modules'})
}

var db_server
function init() {
    let config = <MicroServiceConfig>configure.get('people')
    var app = express()
    app.get('/node_modules/*', handle_node_modules);
    app.get('/test',handleTestPage);
    db_server = new SingleTypeDatabaseServer<Person>({
        config,
        log,
        mongoose_data_definition: PERSON_SCHEMA_DEF
    })
    db_server.configureExpress(app)
    people_web_handler.configureExpress(app)
    db_server.connect((error) => {
        if (!error) {
            const api_port = config.api_port
            log.info({config}, `listening on port=${api_port}`)
            app.listen(api_port)
        } else {
            throw error
        }
    })
}


init()

