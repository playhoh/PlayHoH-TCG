import React from "react"
import {debug, parseUrlParams} from "../src/utils"
import {getCount} from "../src/baseApi"
import {HohApiWrapper} from "../src/client/clientApi"
import {Container} from "@mui/material"
import {AdminBar} from "../components/AdminBar"
import {AdminTable} from "../components/AdminTable"
import {currentUser, queryUsers} from "../src/client/userApi"
import {gameName} from "../components/constants"
import {Layout} from "../components/Layout"

type AdminLogicState = { cards?: any[], users?: any[] }

const AdminLogic = () => {
    const [user, setUser] = React.useState(undefined)
    const [isLoggedOut, setLoggedOut] = React.useState(undefined)
    const [count, setCount] = React.useState(undefined)
    const [data, setData] = React.useState<AdminLogicState>({})
    const [queryText, setQueryText] = React.useState("")
    const [loading, setLoading] = React.useState(true)


    React.useEffect(() => {
        let params = parseUrlParams()
        debug("params", params)

        getCount().then(res => setCount(res))
        currentUser(u => {
            setUser(u)
            setLoggedOut(false)
            const q = params.q
            if (q) {
                search(q, true, params.o)
            }
        }, () => {
            setLoggedOut(true)
            setLoading(false)
            console.log("no logged in user on admin?")
        })
    }, [])

    function search(text, overrideCall?: boolean, searchObjects?: boolean) {
        if (!overrideCall && isLoggedOut)
            return

        setQueryText(text)
        console.log("Search " + text)
        setData({})

        let res = {} as AdminLogicState
        setLoading(true)
        queryUsers(users => {
            res.users = users
            setData(res)
            setLoading(false)
        }, text)
    }

    const moreProps = {
        user, data, search, queryText, setQueryText, isLoggedOut,
        setLoggedOut, loading, count
    }

    return <>
        <AdminBar {...moreProps} />
        <Container>
            {data?.users?.length > 0 && <AdminTable
                {...moreProps}
                header="Users"
                rows={data.users}
                cols={["username", "email", "emailVerified"]}/>}

            {data?.cards?.length === 0 && data?.users?.length === 0 && !loading
                && "Sorry, no results for '" + queryText + "'"}

            <pre>{/*JSON.stringify(props, null, 2)*/}</pre>
        </Container>
    </>
}

export default function AdminPage() {
    return (<Layout title={gameName("ADMIN")} noCss mui>
        <HohApiWrapper>
            <AdminLogic/>
        </HohApiWrapper>
    </Layout>)
}
