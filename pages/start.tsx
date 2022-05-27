import Layout from "../components/Layout"
import React from "react"
import {HohApiWrapper} from "../src/client/baseApi"
import SignIn from "../components/SignIn"
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

// export default function StartPage() {
//     const {isAuthenticated, user} = useUser()
//     const [loggedIn, setLoggedIn] = React.useState(false)
//     React.useEffect(() => {
//         setLoggedIn(isAuthenticated)
//     }, [isAuthenticated])
//
//     return (
//         <HohApiWrapper>
//             {loggedIn
//                 ? <Layout title={gameName("Home")} noCss gameCss mui noModeToggle>
//                     <HomeLogic/>
//                 </Layout>
//                 : <Layout title={gameName("Start Playing")} noCss mui>
//                     <SignIn onSignedIn={() => setLoggedIn(true)}/>
//                 </Layout>}
//         </HohApiWrapper>
//     )
// }
