import React from "react"
import {Layout} from "../components/Layout"
import {HohApiWrapper} from "../src/client/clientApi"
import {Container} from "@mui/material"
import {useUser} from "../src/client/userApi"
import {LoginFirst} from "../components/LoginFirst"
import {JoinDiscord} from "../components/JoinDiscord"

const CreatorLogic = () => {
    const {isAuthenticated} = useUser()
    return !isAuthenticated
        ? <LoginFirst/>
        : <Container>
            {'Got an idea for a card? Please contact us!'}
            <JoinDiscord/>
        </Container>

}

export default function CreatorPage() {
    return (
        <Layout noCss mui>
            <HohApiWrapper>
                <CreatorLogic/>
            </HohApiWrapper>
        </Layout>
    )
}
