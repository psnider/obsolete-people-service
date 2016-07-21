import SENECA = require('seneca')
import configure = require('configure-local')
import test_support = require('test-support')


var seneca = SENECA(configure.get('seneca'))
seneca.use('seneca-entity')
seneca.use('people-plugin')
seneca.listen({type:'tcp', pin:'role:people'})


if (configure.get('people:use_test_data')) {
    test_support.seedTestDatabase(seneca)
}
