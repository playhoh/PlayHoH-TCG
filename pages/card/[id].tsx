import React from "react"
import {Layout} from "../../components/Layout"
import {HohApiWrapper} from "../../src/client/baseApi"
import {Button, Container} from "@mui/material"
import {GetStaticPropsContext} from "next/types"
import {baseGameNameShort} from "../../components/constants"
import {BASE_URL} from "../../src/utils"
import {LoadingProgress} from "../../components/LoadingProgress"

export async function getStaticPaths(context) {
    return {paths: [], fallback: true}
}

export async function getStaticProps(context: GetStaticPropsContext) {
    const params = context.params
    const id = params.id ?? ""

    let error = ""
    let card = {}
    if (id)
        try {
            card = await fetch(BASE_URL + "/api/card/" + id).then(x => x.json())
        } catch (e) {
            error = e
        }
    return {
        props: {id, card, error: error.toString()},
    }
}

export default function CardPage({id, card, error}) {
    let cardName = card?.name ?? ""
    return (
        <Layout gameCss mui title={cardName ? cardName + " | " + baseGameNameShort : baseGameNameShort}>
            <HohApiWrapper>
                <Container>
                    {id
                        ? <>
                            <h2>Card #{id}: {cardName || "(Not found)"} | {baseGameNameShort}</h2>
                            {error && <pre>Error: {error}</pre>}
                            {id && <img src={"/api/svg/" + id} alt="" height="800"/>}
                            <br/>
                            {card?.nftUrl &&
                                <Button href={card.nftUrl} fullWidth variant="outlined">
                                    {'Buy'}
                                </Button>}
                        </>
                        : <LoadingProgress/>
                    }
                </Container>
            </HohApiWrapper>
        </Layout>
    )
}
