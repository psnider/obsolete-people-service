declare module 'test-support' {

    import SENECA = require('seneca')

    // TODO: use type declaration once seneca has been rewritten to expose it correctly
    // export function seedTestDatabase(seneca: SENECA.Seneca) : Promise<boolean[]>
    export function seedTestDatabase(seneca) : Promise<boolean[]>
}
