import {Api} from "../Api"

export module ApiClient {
    export class User {
        email = ""
        password = ""
        username = ""
        role = ""
        displayName = ""
        isAdmin = false
        emailVerified = false
        sessionToken = ""

        constructor() {
        }

        set(key, val) {
            this[key] = val
        }

        get(key) {
            return this[key]
        }

        signUp() {
            return _signUp(this)
        }

        save() {
            return _save(this)
        }

        static logIn(email, password) {
            return _logIn(email, password)
        }

        static requestPasswordReset(mail) {
            return _requestPasswordReset(mail)
        }

        static logOut() {
            return _logOut()
        }

        static current() {
            return _current()
        }
    }
}


async function _logIn(email, password) {
    return await fetch("/api/v2/user", {
        method: "POST", body: JSON.stringify({email, password})
    }).then(x => x.json()).then(x => {
        _setCurrent(x)
        return Api.wrap(x)
    })
}

async function _signUp(user) {
    return await fetch("/api/v2/user", {
        method: "POST", body: JSON.stringify({user})
    }).then(x => x.json()).then(x => {
        _setCurrent(x)
        return Api.wrap(x)
    })
}

async function _requestPasswordReset(email) {
    return await fetch("/api/v2/forgot-password", {
        method: "POST", body: JSON.stringify({email})
    }).then(x => x.json()).then(x => {
        localStorage.setItem("HoH_User", JSON.stringify(x))
        return Api.wrap(x)
    })
}

async function _save(user) {
    return await fetch("/api/v2/user", {
        method: "PATCH", body: JSON.stringify(user)
    }).then(x => x.json()).then(x => {
        localStorage.setItem("HoH_User", JSON.stringify(x))
        return Api.wrap(x)
    })
}

function _logOut() {
    localStorage.removeItem("HoH_User")
}

function _current() {
    let item = localStorage.getItem("HoH_User")
    if (item)
        try {
            let user = new ApiClient.User()
            let newVar = item && JSON.parse(item)
            Object.keys(newVar).forEach(x => user[x] = newVar[x])
            user.username = user.email
            return user
        } catch (e) {
        }
}

function _setCurrent(user) {
    localStorage.setItem("HoH_User", JSON.stringify(user, null, 2))
}
