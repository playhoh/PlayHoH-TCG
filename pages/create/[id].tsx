import React from "react"
import {Layout} from "../../components/Layout"
import {HohApiWrapper} from "../../src/client/baseApi"
import {Button, Container, TextField} from "@mui/material"
import {useUser} from "../../src/client/userApi"
import {LoginFirst} from "../../components/LoginFirst"
import {debug} from "../../src/utils"

export async function getStaticPaths(context) {
    return {
        paths: ["/create/betacreatoraccessnevergivethistoothers"], fallback: false
    }
}

export async function getStaticProps(context) {
    return {
        props: {data: context.params},
    }
}

const CreatorLogic = () => {
    const {isAuthenticated, user, userPointer, isLoggedOut, loggedOut, setLoggedOut} = useUser()

    const [text, setText] = React.useState("")
    const [res, setRes] = React.useState(undefined)
    const [res2, setRes2] = React.useState(undefined)
    const [img, setImg] = React.useState("")

    function click() {
        debug(text)
        setImg("")
        setRes(undefined)
        setRes2(undefined)
        fetch("../api/wiki2card/" + text).then(x => x.json()).then(moreData => {
            setImg(moreData.img)
            setRes(moreData.wikitext)
            setRes2(moreData)
        })
    }

    return !isAuthenticated ? <LoginFirst/> : <>
        <Container>
            <TextField
                fullWidth autoFocus
                value={text} onChange={x => setText(x.target.value)}
                onKeyDown={x => x.key === 'Enter' && click()} placeholder="Wikipedia page"/>
            <br/>
            <Button disabled={isLoggedOut} onClick={click}>
                Fetch page
            </Button>

            <h2>Data</h2>
            <pre>{JSON.stringify(res2, null, 2)}</pre>

            {!img ? "" : <img src={img} alt="" width="400"/>}

            <hr/>
            <h2>Faces for name parts</h2>
            <img src={"../api/face/" + res2?.firstName || ""} alt=""/>

            <h2>Text</h2>
            <pre>{res}</pre>

        </Container>
    </>
}

export default function AdminPage() {
    return (
        <Layout noCss mui>
            <HohApiWrapper>
                <CreatorLogic/>
            </HohApiWrapper>
        </Layout>
    )
}
