import React from 'react'
import {Layout} from "../components/Layout"
import {AtlassianDragAndDrop, initGameState} from "../components/AtlassianDragAndDrop"
import {HohApiWrapper} from "../src/client/clientApi"
import {useUser} from "../src/client/userApi"
import {GameLog} from "../components/GameLog"
import {LoadingProgress} from "../components/LoadingProgress"
import {LoginFirst} from "../components/LoginFirst"
import {gameName} from "../components/constants"
import {CircularProgress, Typography} from "@mui/material"
import {debug} from "../src/utils"
import {GameState} from "../interfaces/gameTypes"

function PlayerLogic() {
    const {user, userPointer, isAuthenticated} = useUser()

    const [gameState, setGameState] = React.useState(initGameState)

    const props = {
        user, userPointer, gameState, setGameState
    }

    function makeProps(makePlay: (info: string, data: GameState, cont: Function) => void, isPlayer1: boolean) {
        return {
            ...props,

            initIsFlipped: isPlayer1,
            initEnemyHandRevealOverride: isPlayer1,
            initYourHandRevealOverride: !isPlayer1,
            noRevealButtons: true,

            enemy: isPlayer1 ? gameState?.player2 : gameState?.player1,
            setGameState: x => {
                if (x?.player1 && x?.player2) {
                    setGameState(x)
                    makePlay('makes a play', x, undefined)
                } else {
                    debug("error with state, ", x)
                }
            }
        }
    }

    return !isAuthenticated
        ? <LoginFirst/>
        : user
            ? <GameLog {...props}>{(makePlay) =>
                (gameState?.player1 && gameState?.player2)
                    ? <AtlassianDragAndDrop
                        {...makeProps(makePlay, user.username === gameState?.player1)}/>
                    : <div style={{padding: 14}}>
                        <CircularProgress/>
                        <Typography color="info">
                            {'Waiting for both players to be online.'}
                        </Typography>
                    </div>
            }</GameLog>
            : <LoadingProgress/>
}

export default function PlayerPage() {
    return (
        <Layout title={gameName("Beta")} noCss gameCss mui>
            <HohApiWrapper>
                <PlayerLogic/>
            </HohApiWrapper>
        </Layout>
    )
}
