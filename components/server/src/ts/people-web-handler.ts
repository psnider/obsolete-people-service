import bodyParser = require('body-parser');
import express = require('express')
import pino = require('pino')

import configure = require('configure-local');



var VERSION = '1.0.0'
var log = pino({name: 'webapp'});



function getStatusJS(req, res) {
    var status = {}
    var js_code = "var server_status = " + JSON.stringify(status)
    log.info({function: 'getStatusJS', session_id: req.session.id}, 'sending')
    res.send(js_code)
}




function handleWebPeople(req, res) {
    if (req.session.user.role === 'admin') {
        var filename = 'components/browser-angular2/src/html/admin.html'
        res.sendFile(filename, {root: '.'})
    } else {
        res.sendStatus(403)
    }
}





function handleAdminPage(req, res) {
    if (req.session.user.role === 'admin') {
        var filename = 'components/browser-angular2/html/html/admin.html'
        res.sendFile(filename, {root: '.'})
    } else {
        res.sendStatus(403)
    }
}



export function configureExpress(app: express.Express) {
    app.get('/admin', handleAdminPage)
    app.use(express.static(process.cwd() + '/components/browser-angular2/html'))
    app.use('/people-app', express.static(process.cwd() + '/components/browser-angular2/html'))
    app.use('/people-app', express.static(process.cwd() + '/generated/browser-angular2'))
    app.get('/systemjs.config.js', (req, res) => {res.sendFile(process.cwd() + '/components/browser-angular2/systemjs.config.js')});
    return app
}

