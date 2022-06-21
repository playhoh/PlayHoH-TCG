import React from "react"
import {Layout} from "../../components/Layout"
import {HohApiWrapper} from "../../src/client/baseApi"
import {Container} from "@mui/material"
import {GetStaticPropsContext} from "next/types"

export async function getStaticPaths(context) {
    return {
        paths: [], fallback: true
    }
}

export async function getStaticProps(context: GetStaticPropsContext) {
    const params = context.params
    const id = params.id

    let error = {}
    let card = {}
    try {
        card = await fetch("/api/card/" + id).then(x => x.json())
    } catch (e) {
        error = e
    }
    return {
        props: {id, card, error},
    }
}

const CardLogic = ({id, card, error}) => {
    return <Container>
        <h2>Card for id={id} yielded {card?.name && JSON.stringify(card)}</h2>
        {error?.message && <pre>Error: {error.message}</pre>}
        Image:
        <img src={"/api/svg/" + id} alt=""/>
    </Container>
}

export default function CardPage(props) {
    return (
        <Layout noCss mui>
            <HohApiWrapper>
                <CardLogic {...props}/>
            </HohApiWrapper>
        </Layout>
    )
}
