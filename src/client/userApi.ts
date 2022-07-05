import React from "react"
import {Moralis} from "moralis"
import {cryptoRandomUUID, debug, log} from "../utils"
import {moralisSetup} from "../baseApi"
import {useMoralis} from "react-moralis"
import {UserData} from "../../interfaces/userTypes"

export async function createUser(loginName: string, password: string, email: string, setUser: Function, setErr: Function) {
    try {
        moralisSetup()
        const user = new Moralis.User()
        user.set("username", loginName)
        user.set("password", password)
        user.set("email", email)
        user.set("verifyid", cryptoRandomUUID())
        await user.signUp()
        setUser(user)
        moralisSetup()

        /*await requestEmailVerification(email)
            .then(() => {
                //user will get an email with a link. If the user clicks on the link his user get authenticated.
                debug("Successfully sent email verification email to " + email)
            })
            .catch((error) => {
                // Show the error message somewhere
                (setErr || alert)("Error: " + error.code + " " + error.message, error.code)
            })*/
        // Hooray! Let them use the app now.
    } catch (error) {
        // Show the error message somewhere and let the user try again.
        (setErr || alert)("Error: " + error.code + " " + error.message, error.code)
    }
}

function requestEmailVerification(email: string) {
    // @ts-ignore // forgotten in interface sadly
    return Moralis.User.requestEmailVerification(email)
}

export async function login(loginName: string, pw: string, setUser: Function, onErr: (str: string, code: number) => any) {
    try {
        moralisSetup()
        const user = (await Moralis.User.logIn(loginName, pw)) as any
        user.emailVerified = user.get("emailVerified")
        console.log("user", user)
        setUser(user)
    } catch (error) {
        (onErr || alert)("Error: " + error.code + " " + error.message, error.code)
    }
}

export async function logOut(onDone: () => any, onErr?: (err: string) => void) {
    try {
        moralisSetup()
        await Moralis.User.logOut()
        onDone()
    } catch (error) {
        (onErr || alert)("Error: " + error.code + " " + error.message)
    }
}

export function currentUser(set: Function, noUser: Function) {
    try {
        moralisSetup()
        const user = Moralis.User.current() as any
        debug("loaded current", user)
        if (user) {
            const username = user.get('username')
            user.username = username
            user.email = user.get('email')
            user.emailVerified = user.get('emailVerified')
            user.deck = user.get('deck')
            user.data = user.get('data')
            user.displayName = displayName(username)
            user.role = user.get('ACL')
            user.isAdmin = user.role !== undefined && user.role["role:admin"] !== undefined
            set(user)
        } else {
            noUser(true)
        }
    } catch (e) {
        log("currentUser err " + e.message)
        noUser(true)
    }
}

export function displayName(username) {
    return username ? username.split(/[\.-_@]/)[0] || username : ""
}

export type UserPointer = {
    get: (key: string) => any,
    set: (key: string, value: any) => void,
    save: () => void
}

export type UseUserResult = {
    isAuthenticated: boolean,
    isLoggedOut: boolean,
    userPointer: UserPointer,
    user?: UserData,
    loggedOut?: string,
    setLoggedOut: (s: string) => void
}

export function useUser(): UseUserResult {
    let obj = {isAuthenticated: false, user: undefined}
    try {
        obj = useMoralis()
    } catch (e) {
        log("useUser: ", e.toString())
    }
    const {isAuthenticated, user} = obj
    const [loggedOut, setLoggedOut0] = React.useState("checking")
    const [isLoggedOut, setIsLoggedOut] = React.useState(true)
    const [userOverride, setUserOverride] = React.useState(false)

    React.useEffect(() => {
        if (!userOverride) {
            setLoggedOut0(isAuthenticated ? "loggedIn" : "loggedOut")
            setIsLoggedOut(!isAuthenticated)
        }
    }, [isAuthenticated, loggedOut])

    const username = user?.get('username')
    const role = user?.get('ACL')
    const isAdmin = role !== undefined &&
        (role["role:admin"] !== undefined || role.permissionsById["role:admin"] !== undefined)

    return {
        isAuthenticated, userPointer: user, loggedOut, isLoggedOut,
        user: !user ? undefined : {
            ...user,
            username,
            email: user.get('email'),
            emailVerified: user.get('emailVerified'),
            accounts: user.get('accounts'),
            displayName: displayName(username),
            deck: user.get('deck'),
            data: user.get('data'),
            sessionToken: user.get('sessionToken'),
            role,
            isAdmin
        },
        setLoggedOut: x => {
            if (x === "loggedOut") {
                setUserOverride(true)
                setIsLoggedOut(true)
                setLoggedOut0("loggedOut")
            }
        }
    }
}

/*export function currentUserASYNC(set: Function, noUser: Function) {
    try {
        moralisSetup()
        Moralis.User.currentAsync().then<void>((user: any) => {
            debug("loaded current ASYNC", user)
            if (user) {
                user.username = user.get('username')
                user.email = user.get('email')
                user.emailVerified = user.get('emailVerified')
                set(user)
            } else {
                noUser(true)
            }
        })
    } catch (e) {
        console.log("currentUser " + e.message)
        noUser(true)
    }
}*/

export async function signOut() {
    return await Moralis.User.logOut()
}

export async function queryUsers(setData, searchText) {
    try {
        moralisSetup(true)
        const query = new Moralis.Query('User')
        //if (searchText)
        //query.fullText('username', searchText)
        query.contains('username', searchText)
        // parseSearch(searchText, query)
        const results = await query.find({useMasterKey: true})
        const res = JSON.parse(JSON.stringify(results))
        // debug("res users", res)
        setData(res)
    } catch (e) {
        log("error queryUsers " + e.message)
    } finally {
        moralisSetup()
    }
}

export function forgotPassword(email, ok, onErr) {
    Moralis.User.requestPasswordReset(email)
        .then(() => {
            ok && ok()
        }).catch((error) => {
        // Show the error message somewhere
        onErr && onErr("Error: " + error.code + " " + error.message)
    })
}

export function changeUserData(userPointer: UserPointer, changeData: (data: any) => any) {
    if (!userPointer)
        return

    const data = userPointer.get('data') ?? {}
    userPointer.set('data', changeData(data))
    userPointer.save()
}