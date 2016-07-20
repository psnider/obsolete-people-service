var configure = require('configure-local')
var CONFIG = configure.get('seneca')


var seneca = require( 'seneca' )(CONFIG)
var x = seneca.use('entity')
x= seneca.use('../../../generated/commonjs/people-plugin')
var x = seneca.listen({type:'tcp', pin:'role:people'})
