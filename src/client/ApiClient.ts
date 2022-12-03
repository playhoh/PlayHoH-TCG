function runStatement(sql, _debugSql?: boolean): Promise<any> {
    return undefined
}

function wrap(object: any) {
    object.get = key => object[key]
    return object
}

async function logIn(user, password) {
    return await fetch("/api/v2/users", {
        method: "POST", body: JSON.stringify({user, password})
    }).then(x => x.json()).then(wrap)
}

function Query(table) {
    this.table = table
    this.params = []
    this.equalTo = (key, val) => this.params.push({equalTo: {key, val}})
    this.toSql = () => `select * from ${table} where ${this.params.map(x=>x.key+"=\""+x.value+"\"").join(" ")}`
    this.subscribe = () => new Promise(() => {
    })
}

export const ApiClient = {
    User: {
        logIn
    },
    Object: {
        extend: x => x
    },
    Query
}
