/// <reference path='../../typings/node/node.d.ts' />
var express = require( 'express' )


var seneca = require( 'seneca' )()
      .use( '../../../commonjs/people-api' )
      .client( { type:'tcp', pin:'role:people' } )


var app = express()
      .use( require('body-parser').json() )
      .use( seneca.export( 'web' ) )
      .use('/static', express.static('src/client/html'))
      .listen(3000)
