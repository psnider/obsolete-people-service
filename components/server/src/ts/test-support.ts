import PATH = require('path')
import test_support = require('test-support')


// now seed the database with the test data
// export function seedTestDatabase(seneca) : Promise<boolean[]> {
export function seedTestDatabase(seneca): Promise<boolean[]> {
    var promises: Promise<boolean>[] = []
    var path = PATH.join(process.cwd(), 'components/server/test/data/people.json')
    var test_data = require(path)
    test_data.forEach((person) => {
        var promise = new Promise((resolve, reject) => {
            seneca.make('person').save$(person, (error, created_person) => {
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
