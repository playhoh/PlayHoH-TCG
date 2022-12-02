import mysql from "mysql"

export let debugSql = false

function runStatement(sql, _debugSql?: boolean): Promise<any> {
    _debugSql = _debugSql ?? debugSql
    // const dev = process.env.NODE_ENV !== 'production'

    const uri = process.env.CONNECTION_URL
    // console.log("env uri='", uri, "'")
    if (!uri)
        throw new Error("CONNECTION_URL not set in env")

    const rest = "multipleStatements=true"
    const dbDebug = process.env.DB_DEBUG ? '?debug=true&' + rest : "?" + rest
    const connection = mysql.createConnection(uri + dbDebug)

    _debugSql && console.log("sql", sql)

    function query(sql, f) {
        connection.query(sql,
            function (error, results, _fields) {
                if (error) throw error

                _debugSql && console.log("res", results)

                f(results)
            })
    }

    return new Promise(f => query(sql, f))
}

export const API = {
    runStatement
}
