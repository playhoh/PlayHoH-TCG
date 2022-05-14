import Layout from "../components/Layout"
import React from "react"
import {HohApiWrapper} from "../src/client/baseApi"
import SignIn from "../components/SignIn"
import {gameName} from "../components/constants"

export default function LoginPage() {

    return (
        <Layout title={gameName("Start Playing")} noCss mui>
            <HohApiWrapper>
                <SignIn/>
            </HohApiWrapper>
        </Layout>
    )
}
