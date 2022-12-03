import {testMode} from "../src/testUtils"
import {ApiServer} from "../src/server/ApiServer"
import crypto from "crypto"
import {schema} from "../pages/api/schema"

/** https://stackoverflow.com/a/55926440 */
export function hash(password: string) {
    return crypto.createHash('sha512').update(password).digest('hex')
}

const describe = (_a, _b) => "this test should be run manually, it drops and creates tables (destructive)"

describe("db connection", () => {
    it("should work",
        async () => {
            testMode()

            function run(...array) {
                function iter(i) {
                    return array[i] && ApiServer.runStatement(array[i]).then(x => {
                        console.log(x)
                        iter(i + 1)
                    })
                }

                return iter(0)
            }

            await run(schema)

            await new Promise(r => setTimeout(r, 1000))
            console.log("done")
        })
})
