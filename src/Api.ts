import {apiCall, debug} from "./utils"

const Obj = Object

export module Api {
    export class Query {
        table = ""
        params = []
        where = []
        suffix = ""

        constructor(table) {
            this.table = table
            this.params = []
            this.where = []
        }

        toSql(moreParams?: any[]) {
            // console.log("sql data", this)
            return `select * from hoh_${this.table.toLowerCase()}s
where ${this.where.map(x =>
                Obj.keys(x).map(k =>
                    x[k].key + " " + k + "\"" + x[k].value + "\""
                ).join(" and ")
            ).join(" ")}
${(moreParams ? [...this.params, ...moreParams] : this.params).map(x => Obj.keys(x).map(k => k + " " + x[k]))}
${this.suffix}
`.trim()
        }

        include(x: any) {
        }

        aggregate(pipeline) {
            return Promise.resolve([])
        }

        subscribe(): Promise<Query> {
            console.log("subscribe: " + this.toSql())

            return new Promise((f) => {
                f(this)
            })
        }

        on(x, f) {
            //console.log("on", "this.where", this.where)
            let arr = this.where.map(w => w[Obj.keys(w)[0]].value)
            const [player1, player2] = arr
            debug("player1,player2", {player1, player2})

            const loadStateNow = (then) => {
                apiCall("/api/v2/game", "POST", {player1, player2}, res => {
                    if (res?.state)
                        res.state = JSON.parse(res.state)

                    if (res) {
                        f(wrap(res))
                    }
                    then && then()
                    //setCode(state)
                })
            }
            let lastTimestamp = 0
            const uploading = 0

            function tick(then) {
                apiCall("/api/v2/ts", "POST", {player1, player2}, x => {
                    //pending = false
                    console.log("interval ", x)
                    let newTimestamp = x?.timestamp
                    let loadNew = new Date(newTimestamp).getTime() > new Date(lastTimestamp).getTime()
                    //console.log("new Date(newTimestamp).getTime() > new Date(lastTimestamp).getTime()",
                    //    new Date(newTimestamp).getTime(), ">", new Date(lastTimestamp).getTime(), "===", loadNew)
                    lastTimestamp = newTimestamp

                    if (loadNew) {
                        if (!uploading)
                            loadStateNow(() => then && then())
                        else
                            then && then()
                    } else
                        then && then()
                })
            }

            let ticker = () => {
            }

            ticker = () => {
                setTimeout(() => {
                    tick(() => ticker())
                }, 1000)
            }

            ticker()
        }

        skip(offset) {
            this.params.push({offset})
            return this
        }

        limit(limit) {
            this.params.push({limit})
            return this
        }

        equalTo(key, value) {
            this.where.push({"=": {key, value}})
            return this
        }

        startsWith(key, value) {
            this.where.push({"like": {key, value: value + "*"}})
            return this
        }

        endsWith(key, value) {
            this.where.push({"like": {key, value: "*" + value}})
            return this
        }

        contains(key, value) {
            this.where.push({"contains": {key, value}})
            return this
        }

        find(ignore ?: any)
            :
            Promise<Api.Object[]> {
            let sql = this.toSql()

            return new Promise(f => {
                Api.runStatement(sql).then(x => f(x.map(wrap)))
            })
        }

        first(ignore ?: any): Promise<Api.Object> {
            let sql = this.toSql([{limit: 1}])

            return new Promise(f => {
                Api.runStatement(sql).then(x => f(wrap(x[0])))
            })
        }

        static or(x, y) {
            const res = JSON.parse(JSON.stringify(x))
            res.suffix = y.toSql()
            let query = new Query(x.table)
            Obj.keys(x).forEach(k => query[k] = x[k])
            return query
        }

        doesNotExist(key: string) {
            this.where.push({"is null": {key, value: ""}})
        }

        exists(key: string) {
            this.where.push({"is not null": {key, value: ""}})
        }

        notEqualTo(key: string, value: string) {
            this.where.push({"!=": {key, value}})
        }

        async count(x ?: any) {
            console.log("TODO SQL", this.toSql())
            return 0
        }
    }

    export class Object {
        x = ""
        y = ""
        className = ""

        constructor(x?: any, y?: any) {
            this.x = x
            this.y = y
        }

        static extend(x: string) {
            return x
        }

        set(key, val) {
            this[key] = val
        }

        get(key) {
            return this[key]
        }

        save(ignore?: any) {
            return new Promise(f => {
                f(this)
            })
        }

        destroy(ignore?: any) {
            return new Promise(f => {
                f(this)
            })
        }

        saveIPFS() {
            return this.save()
        }
    }

    export function wrap(object: any) {
        if (object) {
            const res = new Api.Object()
            Obj.keys(object).forEach(k => res[k] = object[k])
            return res
        }
        return object
    }

    export class File extends Object {
        url() {
            return ""
        }
    }

    export let serverURL = ""
    export let masterKey = ""
    export let moralisappid = ""

    export function initialize(moralisappidParam: any, ignore?: any, ingore2?: any) {
        moralisappid = moralisappidParam
    }

    export function enableWeb3() {
        return new Promise(f => {
            f({})
        })
    }

    export function runStatement(x: string): Promise<any[]> {
        throw new Error("not in server code")
    }
}
