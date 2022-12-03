import {hash} from "../../test/dbTest.test"

const mail = "brox.p@web.de"
const player2 = "test@web.de"
const pw = hash("secret42password")

export const schema = [
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
player1 varchar(255) not null,
player2 varchar(255) not null,
state json default ("{}"),
timestamp timestamp default null,
primary key (player1, player2)
)`,
    `insert into hoh_game (player1 , player2 ) values ("a", "b")`,
    `update hoh_game set state = JSON_SET(state, '$.yourField', '[]'), timestamp=NOW() where player1 = "a" and player2 = "b"`,
    `select * from hoh_game`,
    `drop table if exists hoh_game_result`,
    `create table hoh_game_result (
id int auto_increment primary key,
state JSON default ("{}"),
timestamp timestamp default 0,
winner varchar(255) default null,
loser varchar(255) default null
)`,
    `select timestamp from hoh_game where player1="${mail}" and player2="${player2}"`
]

export default (req, res) => {
    res
        .status(200)
        .end(schema.join(";\n\n") + ";")
}
