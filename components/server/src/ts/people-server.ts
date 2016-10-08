import body_parser = require('body-parser');
import express = require('express')
import pino = require('pino')

import configure = require('configure-local')
import people_api_handler = require('./people-api-handler')
import people_web_handler = require('./people-web-handler')
import db = require('./people-db')
import test_support = require('./test-support')


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


log.info({version: VERSION})


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

db.connect((error) => {
    if (!error) {
        var app = express()
        app.get('/node_modules/*', handle_node_modules);
        app.get('/test',handleTestPage);
        people_api_handler.configureExpress(app)
        people_web_handler.configureExpress(app)
        const port = configure.get('people:port')
        app.listen(port)
    } else {
        throw error
    }
})
    


