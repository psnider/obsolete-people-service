var configure = require('configure-local')
var CONFIG = configure.get('seneca')


require( 'seneca' )(CONFIG)
  .use('../../../generated/commonjs/people-plugin')
  // listen for role:math messages
  // IMPORTANT: must match client
  .listen({type:'tcp', pin:'role:people'})
