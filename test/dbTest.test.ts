import {testMode} from "../src/testUtils"
import {API} from "../src/server/db"
import crypto from "crypto"

/** https://stackoverflow.com/a/55926440 */
export function hash(password: string) {
    return crypto.createHash('sha512').update(password).digest('hex')
}

const describe = (_a, _b) => "this test should be run manually, it drops and creates tables (destructive)"

describe("db connection", () => {
    it("should work",
        async () => {
            testMode()
            //const res = await API.runSql("select * from users")
            //console.log(res)
            // API.test(x => console.log("test res", x))

            const mail = "brox.p@web.de"
            const player2 = "test@web.de"
            const pw = hash("asd")

            function run(...array) {
                function iter(i) {
                    return array[i] && API.runStatement(array[i]).then(x => {
                        console.log(x)
                        iter(i + 1)
                    })
                }

                return iter(0)
            }

            await run(
                `drop table if exists hoh_users`,
                `create table hoh_users (
id int auto_increment primary key,
email varchar(255) default null,
password varchar(255) default null,
data JSON default ("{}")
)`,
                `insert into hoh_users(email, password) values ("${mail}", "${pw}")`,
                `select * from hoh_users`,
                `drop table if exists hoh_cards`,
                `create table hoh_cards (
id int auto_increment primary key,
name varchar(255) default null,
displayName varchar(255) default null,
text varchar(255) default null,
typeLine varchar(255) default null,
key varchar(255) default null,
power varchar(255) default null,
wits varchar(255) default null,
cost varchar(255) default null,
flavour varchar(255) default null,
imgPos varchar(255) default null,
comment varchar(255) default null,
logic varchar(255) default null
)`,
                `drop table if exists hoh_game`,
                `create table hoh_game (
player1 varchar(255) default null,
player2 varchar(255) default null,
state JSON default ("{}"),
timestamp int default 0,
winner varchar(255) default null,
loser varchar(255) default null,
primary key (player1, player2)
)`,
                `drop table if exists hoh_game_result`,
                `create table hoh_game_result (
id int auto_increment primary key,
state JSON default ("{}"),
timestamp int default 0,
winner varchar(255) default null,
loser varchar(255) default null
)`,
                `select timestamp from hoh_game where player1="${mail}" and player2="${player2}"`,
            )

            await new Promise(r => setTimeout(r, 1000))
            console.log("done")
        })
})
