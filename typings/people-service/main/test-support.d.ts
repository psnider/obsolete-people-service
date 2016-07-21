declare module 'test-support' {

    import SENECA = require('seneca')

    export function seedTestDatabase(seneca: SENECA.Seneca) : Promise<boolean[]>
}
