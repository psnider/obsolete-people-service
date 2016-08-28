import fs = require('fs')
import EventEmitter = require('events');
import PATH = require('path')
import express = require('express')
import session = require('express-session');
import favicon = require('serve-favicon');
import pino = require('pino');
import bodyParser = require('body-parser');
import REQUEST = require('request');
import PASSPORT = require('passport')
var PassportConstructor : any = PASSPORT['Passport']
import flash = require('connect-flash');
import sse = require('server-sent-events');
import AREAS_INDEX = require('areas-index');
import DataFeedApp = require('DataFeedApp');
import configure = require('configure');
import accounts = require('accounts');


var VERSION = '1.0.0'
var areas_display_config: any = JSON.parse(fs.readFileSync('components/map-viewer/db/areas.json').toString())
var logger = pino({name: 'map-customer'});



// Get a config parameter and repace any '${area_name}' variable strings with the area_name
function  getConfigParamWithArea(area_name, config_key) {
    var template = configure.get(config_key)
    var url = template.replace(/\${area_name}/g, area_name)
    return url
}


export function sendLatestSensorReadingsViaSSE(area_name, done: (status_code) => void) {
    var fname = 'sendLatestSensorReadingsViaSSE'
    var sensor_readings_report = AREAS_INDEX.getSensorReadingsReport(area_name)
    if (sensor_readings_report) {
        logger.info({fname, area_name, source: 'cache'})
        sse.sendSensorReadingsViaSSE(sensor_readings_report);
    } else {
        const READINGS_URL = getConfigParamWithArea(area_name, 'map-server:get-readings-url')
        REQUEST(READINGS_URL, function (error, response, body) {
            if (!error) {
                if (response.statusCode == 200) {
                    var sensor_readings_report = JSON.parse(body);
                    AREAS_INDEX.setSensorReadingsReport(sensor_readings_report)
                    logger.info({fname, area_name, source: 'get-reading-url'})
                    sse.sendSensorReadingsViaSSE(sensor_readings_report);
                    done(200)
                } else {
                    logger.warn({fname, area_name, source: 'get-devices-url', statusCode: response.statusCode}, 'failed')
                    done(response.statusCode)
                }
            } else {
                logger.warn({fname, area_name, error})
                done(500)
                return
            }
        })
    }
}


function getStatusJS(req, res) {
    const AREA_NAMES = ['Ohio']
    const HOSTNAME = configure.get('map-server:hostname')
    const PORT = configure.get('map-server:public-port')
    var status = {}
    for (var area_name of AREA_NAMES) {
        var map_url = 'http://' + HOSTNAME + ':' + PORT + '/' + area_name + '/map'
        var devices_report_time
        var readings_report_time
        var area = AREAS_INDEX.getArea(area_name)
        if (area) {
            devices_report_time  = area.devices_report ? area.devices_report.report_timestamp : null
            readings_report_time = area.sensor_readings_report ? area.sensor_readings_report.report_timestamp : null
        }
        status[area_name] = {map_url, devices_report_time, readings_report_time}
    }
    var js_code = "var server_status = " + JSON.stringify(status)
    logger.info({function: 'getStatusJS', session_id: req.session.id}, 'sending')
    res.send(js_code)
}


// send the base file
function getMapApp(req, res) {
    var area_name = req.session['user'].area_names[0]
    if (area_name && (area_name in areas_display_config)) {
        var filename = 'components/map-viewer//client/src/html/map.html'
        res.sendFile(filename, {root: '.'})
    } else {
        res.sendStatus(400)
    }
}


function getMapAppCode(req, res) {
    var area_name = req.session['user'].area_names[0]
    if (area_name && (area_name in areas_display_config)) {
        fs.readFile('generated/browser/map-viewer-map-webapp.js', (error, data) => {
            if (error) throw error
            res.writeHead(200, {
                "Content-Type": "text/plain"
            });
            var initial_display = JSON.stringify(areas_display_config[area_name].initial_display)
            var code = "var initial_display = " + initial_display + ';\n'
            res.write(code)
            res.write(data)
            res.end()
        })
    } else {
        res.sendStatus(400)
    }
}


// TODO: want a cache here in case there are many clients
function sendDevicesViaSSE(req, res) {
    var fname = 'sendDevicesViaSSE'
    function sendViaSSE(devices_report) {
        sse.sendDevicesViaSSE(devices_report);
        sendLatestSensorReadingsViaSSE(area_name, (status_code) => {
            res.sendStatus(status_code)
        })
    }
    var area_name = req.session['user'].area_names[0]
    var devices_report = AREAS_INDEX.getDevicesReport(area_name)
    if (devices_report) {
        logger.info({fname, area_name, source: 'cache'})
        sendViaSSE(devices_report)
    } else {
        const DEVICES_URL = getConfigParamWithArea(area_name, 'map-server:get-devices-url')
        REQUEST(DEVICES_URL, function (error, response, body) {
            if (!error) {
                if (response.statusCode == 200) {
                    var devices_report = JSON.parse(body);
                    AREAS_INDEX.setDevicesReport(devices_report)
                    logger.info({fname, area_name, source: 'get-devices-url'})
                    sendViaSSE(devices_report);
                } else {
                    logger.warn({fname, area_name, source: 'get-devices-url', statusCode: response.statusCode}, 'failed')
                    res.sendStatus(response.statusCode)
                }
            } else {
                logger.warn({fname, area_name, error})
                res.sendStatus(500)
            }
        })
    }
}


// this only for the admin page, Map App uses SSE
function admin_getDevices(req, res) {
    if (req.session.user.role === 'admin') {
        var area_name = req.params.area_name
        var area = AREAS_INDEX.getArea(area_name)
        if (area) {
            if (area.devices_report) {
                logger.info({function: 'getDevices', area_name, device_count: area.devices_report.features.length, session_id: req.session.id}, 'sending')
                res.send(area.devices_report);
            } else {
                res.sendStatus(404)  // NOT FOUND
            }
        } else {
            res.sendStatus(404)  // NOT FOUND
        }
    } else {
        res.sendStatus(404)  // NOT FOUND
    }
}


// this only for the admin page, Map App uses SSE
function admin_getReadings(req, res) {
    if (req.session.user.role === 'admin') {
        var area_name = req.params.area_names
        var area = AREAS_INDEX.getArea(area_name)
        if (area) {
            if (area.sensor_readings_report) {
                logger.info({function: 'getReadings', area_name, device_count: area.sensor_readings_report.sensor_readings.length, session_id: req.session.id}, 'sending')
                res.send(area.sensor_readings_report);
            } else {
                res.sendStatus(404)  // NOT FOUND
            }
        } else {
            res.sendStatus(404)  // NOT FOUND
        }
    } else {
        res.sendStatus(404)  // NOT FOUND
    }
}


function getAdminPage(req, res) {
    if (req.session.user.role === 'admin') {
        var filename = 'components/map-viewer//client/src/html/admin.html'
        res.sendFile(filename, {root: '.'})
    } else {
        res.sendStatus(403)
    }
}


function sendSensorReadingsViaSSE_ifHaveDevices(sensor_readings_report: SensorReadingsReport_v2) {
    var area = AREAS_INDEX.getArea(sensor_readings_report.area_name, true)
    if (area.devices_report) {
        sse.sendSensorReadingsViaSSE(sensor_readings_report)
    } else {
        logger.warn({function: 'sendSensorReadingsViaSSE_ifHaveDevices', area_name: sensor_readings_report.area_name}, 'postponing sending because there are no devices yet')
    }
}


export function create() {
    DataFeedApp.emitter.on(DataFeedApp.EVENT_DEVICES_UPDATED, sse.sendDevicesViaSSE)
    DataFeedApp.emitter.on(DataFeedApp.EVENT_SENSOR_READINGS_REPORT, sendSensorReadingsViaSSE_ifHaveDevices)
    var passport: PASSPORT.Passport = new PassportConstructor()
    accounts.initPassport(passport)
    const ONE_MONTH_AGE = 28 * 24 * 60 *60 * 1000
    const HOSTNAME = configure.get('map-server:hostname')
    const WEBAPP_URL = configure.get('virtual-sensors:webapp_url')
    const PORT = configure.get('map-server:public-port')
    var app = express()
    app.use(favicon('assets/favicon.ico'));
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(session({
        secret: '7b181bd1-0e7d-4622-a520-9744c9a48f17',
        resave: false,
        saveUninitialized: false,
        cookie: { path: '/', httpOnly: true, secure: false, maxAge: ONE_MONTH_AGE }
    }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    // routes
    app.get('/', (req, res) => {res.sendFile('components/shared/browser/html/public/login.html', {root: '.'})})
    app.get('/login-failed', (req, res, next) => {
        accounts.handleLoginFailed(WEBAPP_URL, req, res, next)
    })
    app.post('/login', function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.redirect('/login-failed'); }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                req.session['user'] = user
                if (req.session['user'].role === 'admin') {
                    var page = '/admin'
                } else {
                    var page = '/map'
                }
                if (req.session['user'].role === 'admin') {
                    // TODO: must find way to select amongst all areas
                    // TODO: determine all available areas
                    // For now, require that all areas are added to the admin account
                }
                return res.redirect(page);
            });
        })(req, res, next);
    });
    app.use(accounts.ensureAuthenticated)
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    app.use('/admin', getAdminPage)
    app.listen(PORT)
    logger.info('map-server started, visit http://' + HOSTNAME + ':' + PORT)
    return app
}
