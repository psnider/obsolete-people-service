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
import configure = require('configure');

