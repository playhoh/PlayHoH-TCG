import Layout from "../components/Layout"
import React from "react"
import {HohApiWrapper} from "../src/client/baseApi"
import SignIn from "../components/SignIn"

export default function LoginPage() {
    const [isBrowser, setBrowser] = React.useState(false)
    React.useEffect(() => {
        setBrowser(process.browser)
    })

    return (
        <Layout title="Start Playing Heroes of History TCG" noCss mui>
            {!isBrowser ? "" : <HohApiWrapper>
                <SignIn/>
            </HohApiWrapper>}
        </Layout>
    )
}
