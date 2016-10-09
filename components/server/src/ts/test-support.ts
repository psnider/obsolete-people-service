import PATH = require('path')
import Database = require('document-database-if')


export function call_done_after_n_calls(max_count: number, done: (error?: Error) => void): (error?: Error) => void {
    let done_called = false
    let done_count = 0
    function done_after_n(error) {
        if (!done_called) {
            if (error) {
                done_called = true
                done(error)
            } else if (++done_count == max_count) {
                done_called = true
                done()
            }
        }
    }
    return done_after_n
}


export function call_done_once(done: (error?: Error) => void): (error?: Error) => void {
    let done_called = false
    function done_once(error) {
        if (!done_called) {
            done_called = true
            done(error)
        }
    }
    return done_once
}


// seed the database with the test data
export function seedTestDatabase(db: Database.DocumentDatabase<Person.Person>): Promise<boolean[]> {
    var promises: Promise<boolean>[] = []
    var path = PATH.join(process.cwd(), 'components/server/test/data/people.json')
    var test_data = require(path)
    test_data.forEach((person) => {
        var promise = new Promise((resolve, reject) => {
            db.create(person, (error, created_person) => {
                if (error) {
                    console.log(`error=${error}`)
                    reject(error)
                } else {
                    resolve(true)
                }
            })
        })
        promises.push(promise)
    })
    // return <Promise<boolean[]> >Promise.all(promises)
    return Promise.all(promises)
}
