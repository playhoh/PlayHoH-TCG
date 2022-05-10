import React, {useEffect} from 'react'
import Layout from "../components/Layout"
import {AtlassianDragAndDrop, initGameState} from "../components/AtlassianDragAndDrop"
import {HohApiWrapper} from "../src/client/baseApi"
import {currentUser, useUser} from "../src/client/userApi"
import GameLog from "../components/GameLog"
import {LoadingProgress} from "../components/LoadingProgress"
import {LoginFirst} from "../components/LoginFirst"

function PlayerLogic({browser}) {
    const {user, userPointer, isAuthenticated} = useUser()

    const [gameState, setGameState] = React.useState(initGameState)

    const props = {user, userPointer, gameState, setGameState, noManualScoring: true}
    return (
        <>
            {!isAuthenticated
                ? <LoginFirst/>
                : (browser && user) ? <GameLog {...props}>{(makePlay) =>
                        gameState?.player1 && gameState?.player2 && <AtlassianDragAndDrop {...{
                            ...props,
                            enemy: user.username === gameState?.player1 ? gameState?.player2 : gameState?.player1,
                            setGameState: x => {
                                setGameState(x)
                                makePlay('makes a play', x, undefined)
                            }
                        }}/>
                    }</GameLog>
                    : <LoadingProgress/>}
        </>
    )
}

export default function PlayerPage() {
    const [browser, set] = React.useState(false)
    useEffect(() => {
        set(process.browser)
        console.log("is Browser " + process.browser)
    }, [])
    return (
        <Layout title="Heroes of History TCG Beta" noCss gameCss mui noModeToggle>
            <HohApiWrapper>
                {!browser ? "" : <PlayerLogic browser={browser}/>}
            </HohApiWrapper>
        </Layout>
    )
}
