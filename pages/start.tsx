import React from "react"
import {Layout} from "../components/Layout"
import {HohApiWrapper} from "../src/client/baseApi"
import {SignIn} from "../components/SignIn"
import {gameName} from "../components/constants"

export default function StartPage() {
    return (
        <HohApiWrapper>
            <Layout title={gameName("Start Playing")} noCss mui>
                <SignIn onSignedIn={() => window.location.href = "/home"}/>
            </Layout>
        </HohApiWrapper>
    )
}
