import React from "react"
import {Layout} from "../../components/Layout"
import {HohApiWrapper} from "../../src/client/baseApi"
import {Button, Container, TextField} from "@mui/material"
import {useUser} from "../../src/client/userApi"
import {LoginFirst} from "../../components/LoginFirst"
import {debug} from "../../src/utils"
import {GetStaticPathsContext, GetStaticPropsContext} from "next/types"

function TT(props: React.PropsWithChildren<any>) {
    return <span style={{fontFamily: "_monospace"}}>{props.children}</span>
}

export async function getStaticPaths(context: GetStaticPathsContext) {
    return {
        paths: ["/category/betacreatoraccessnevergivethistoothers"], fallback: false
    }
}

export async function getStaticProps(context: GetStaticPropsContext) {
    return {
        props: {data: context.params},
    }
}

const CategoryLogic = () => {
    const {isAuthenticated, isLoggedOut} = useUser()
    const [text, setText] = React.useState("")
    const [res, setRes] = React.useState([])

    function click() {
        debug(text)

        setRes([])
        /*
        fetchCat(birthsCat, 0, "0", x => {
            setRes(res => res.concat(x))
        })
        */

        const cat = text
        fetch("../api/wiki-category/" + cat).then(x => x.json()).then(items => {
            setRes(items)
            const arr = items.filter(x => !x.category)

            function iter(i) {
                if (arr[i]) {
                    const name = arr[i].name
                    fetch("../api/wiki2card/" + name + "?" + cat).then(x => x.json()).then(moreData => {
                        setRes(old => old.map(x => x.name === name ? {...x, moreData, done: true} : x))
                        iter(i + 1)
                    })
                }
            }

            iter(0)
        })
    }

    return !isAuthenticated ? <LoginFirst/> : <>
        <Container>
            <h2>Download category, e.g. <TT>Category:1880s births</TT></h2>
            <TextField fullWidth autoFocus
                       value={text} onChange={x => setText(x.target.value)}
                       onKeyDown={x => x.key === 'Enter' && click()} placeholder="Category name, as in wiki url"/>
            <br/>

            <Button disabled={isLoggedOut} onClick={click}>
                Fetch category
            </Button>

            <h2>Categories</h2>
            <div>{res?.filter && res.filter(x => x.category).map((x, i) => <div key={i}>{i}: <span onClick={() => {
                setText(x.name)
            }}>{x.name}</span></div>)}</div>

            <h2>Pages: {res?.filter(x => x.done)?.length} / {res?.length} <small>anaylzed. Be patient...</small></h2>
            <div>{res?.filter && res.filter(x => !x.category).map((x, i) => <div
                key={i}>
                {i}: {x.name} {x.done ? " ✅ Analyzed! " : ""}
                <small>{x.moreData?.typeLine}</small>
            </div>)}
            </div>
            <b>All saved in WikiPerson!</b>
        </Container>
    </>
}

export default function CategoryPage() {
    return (
        <Layout noCss mui>
            <HohApiWrapper>
                <CategoryLogic/>
            </HohApiWrapper>
        </Layout>
    )
}
