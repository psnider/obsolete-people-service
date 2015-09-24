/// <reference path='../../typings/node/node.d.ts' />

var seneca = require( 'seneca' )()
      .use( '../../../commonjs/people-api' )
      .client( { type:'tcp', pin:'role:people' } )


var app = require( 'express' )()
      .use( require('body-parser').json() )
      .use( seneca.export( 'web' ) )
      .listen(3000)
