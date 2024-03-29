import mysql from "mysql"
import {Api} from "../Api"

export let debugSql = false

function runStatement(sql, _debugSql?: boolean): Promise<any> {
    return new Promise((f, err) => {
        _debugSql = _debugSql ?? debugSql
        _debugSql && console.log("sql", sql)
        // const dev = process.env.NODE_ENV !== 'production'

        const uri = process.env.CONNECTION_URL
        // console.log("env uri='", uri, "'")
        if (!uri)
            throw new Error("CONNECTION_URL not set in env")

        const rest = "multipleStatements=true"
        const dbDebug = process.env.DB_DEBUG ? '?debug=true&' + rest : "?" + rest
        const connection = mysql.createConnection(uri + dbDebug)
        try {

            connection.query(sql,
                function (error, results, _fields) {

                    if (error)
                        err(error)
                    else {
                        _debugSql && console.log("res", results)

                        f(results)
                    }
                })
        } finally {
            connection.end()
        }
    })
}

export const ApiServer = {
    runStatement,
    init: () => {
        Api.runStatement = runStatement
    }
}
Api.runStatement = runStatement
