/// <reference path='../../typings/node/node.d.ts' />
var express = require( 'express' )


var seneca = require( 'seneca' )()
      .use( '../../../generated/commonjs/people-api' )
      .client( { type:'tcp', pin:'role:people' } )


var app = express()
      .use( require('body-parser').json() )
      .use( seneca.export( 'web' ) )
      .use('/people', express.static('src/client/html'))
      .use('/people/script', express.static('amd'))
      .use('/people/script', express.static('lib'))
      .listen(3000)
