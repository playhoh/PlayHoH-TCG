import React from "react"
import {Layout} from "../../components/Layout"
import {HohApiWrapper} from "../../src/client/clientApi"
import {Button, Container} from "@mui/material"
import {baseGameNameShort} from "../../components/constants"
import {BASE_URL} from "../../src/utils"
import {GetStaticPropsContext} from "next/types"

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
            card = await fetch(BASE_URL + "/api/cards/" + id).then(x => x.json())
        } catch (e) {
            error = e
        }

    return {
        props: {id, card, error: error.toString()}
    }
}

export default function CardPage({id, card, error}) {
    let img = "/api/img/" + id
    // const [card, setCard] = React.useState(undefined)
    let cardName = card?.name ?? ""

    return (!process.browser ? "" :
            <Layout gameCss mui
                    img={img}
                    title={cardName ? cardName + " | " + baseGameNameShort : baseGameNameShort}>
                <HohApiWrapper>
                    <Container>
                        <h2>Card #{id} {cardName ? ":" + cardName : ""} | {baseGameNameShort}</h2>
                        {error && <pre>Error: {error}</pre>}
                        <img src={img} alt="" height="800"/>
                        <br/>
                        {card?.nftUrl &&
                            <Button href={card.nftUrl} fullWidth variant="outlined">
                                {'Buy'}
                            </Button>
                        }
                    </Container>
                </HohApiWrapper>
            </Layout>
    )
}
