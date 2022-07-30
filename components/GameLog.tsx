import * as React from 'react'
import {Dispatch, ReactNode} from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import {Button, Container, IconButton, Link, TextField, Tooltip} from "@mui/material"
import {Moralis} from "moralis"
import {debug, now} from "../src/utils"
import {BugReport, ContentCopy} from "@mui/icons-material"
import {apiInitState} from "./AtlassianDragAndDrop"
import {GameState} from "../interfaces/gameTypes"
import {changeUserData} from "../src/client/userApi"
import {InfoBox} from "./InfoBox"

const Game = Moralis.Object.extend('Game')
type GameLogProps = {
    gameState: GameState,
    setGameState: Dispatch<GameState>,
    user: any,
    userPointer: any,
    children: (makePlay: (info: string, data: GameState, cont: Function) => void) => ReactNode
}

export function GameLog({gameState, setGameState, user, userPointer, children}: GameLogProps) {
    const [err, setErr] = React.useState(null)
    const [opponent, setOpponent] = React.useState("")
    const [started, setStarted] = React.useState(false)
    const [debugMode, setDebugMode] = React.useState(false)

    function acceptNewState(obj) {
        // TODO: later: display diff / animate or whatever

        const d = obj.get('data')
        const player1 = obj.get('player1')
        const player2 = obj.get('player2')
        debug("got state from server D:", d, "P1:", player1, "P2:", player2)
        if (d !== undefined) {
            let obj = {...d, player1, player2}
            setGameState(obj)
        }
    }

    function startQueryFor(player1, player2, then?: Function, then2?: Function) {
        const arr = [player1, player2]
        arr.sort()
        const [p1, p2] = arr

        let query = new Moralis.Query(Game)
        query.equalTo("player1", p1)
        query.equalTo("player2", p2)

        query.subscribe()
            .then(subscription => {
                setErr("subscribed :)")
                subscription.on('create', (object: Moralis.Object) => {
                    acceptNewState(object)
                })

                changeUserData(userPointer, data => ({...data, lastPlayed: now()}))

                /*subscription.on('open', () => {
                    acceptNewState('open')
                });
                subscription.on('update', (object: Moralis.Object) => {
                    acceptNewState('update', object)
                });
                subscription.on('enter', (object: Moralis.Object) => {
                    acceptNewState('enter', object)
                });
                subscription.on('leave', (object: Moralis.Object) => {
                    acceptNewState('leave', object)
                });
                subscription.on('delete', (object: Moralis.Object) => {
                    acceptNewState('delete', object)
                });
                subscription.on('close', () => {
                    acceptNewState('close')
                });*/
                if (then)
                    then(then2)

            }).catch(e => setErr(e.message))

    }

    function findExistingGamesForPlayer() {
        let query =
            Moralis.Query.or(
                new Moralis.Query(Game).equalTo("player1", user?.username),
                new Moralis.Query(Game).equalTo("player2", user?.username)
            )

        query.find().then(x => {
            debug("games for " + user?.username, ": ", x?.length)
            const arr = x.map(e => ({
                player1: e.get('player1'),
                player2: e.get('player2'),
                createdAt: e.get('createdAt')
            }))

            if (arr.length > 0) {
                arr.sort((a, b) => a?.createdAt?.toISOString()?.localeCompare(b?.createdAt?.toISOString()))
                //debug("matches for you, sorted: ", arr)
                const mostRecent = arr[0]
                //debug("mostRecent", mostRecent)
                if (mostRecent.player1 && mostRecent.player1 !== user?.username) {
                    setOpponent(mostRecent.player1)
                }
                if (mostRecent.player2 && mostRecent.player2 !== user?.username) {
                    setOpponent(mostRecent.player2)
                }
            } else {
                setErr("No matches for you")
            }
        }).catch(setErr)
    }

    function makePlay(info, data, then) {
        const arr = [user?.username, opponent]
        arr.sort()
        const [p1, p2] = arr
        // debug("arr", arr)
        const g = new Game()
        g.set('info', info)
        g.set('data', data)
        g.set('player1', p1)
        g.set('player2', p2)
        g.save().then(x => {
            setErr("(move sent to server)")
            if (then)
                then()
        }).catch(setErr)
    }

    React.useEffect(() => {
        findExistingGamesForPlayer()
    }, [])

    const bugLink = ""

    const bugLinkButton =
        <Link href="#" onClick={() => setDebugMode(!debugMode)} variant="body2" title={'Debug'}>
            <Typography variant="body2" style={{padding: 5, color: "#fff"}}>
                <BugReport/>
            </Typography>
        </Link>

    return (!started
        ?
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography>
                    {user ? "Hi, " + user?.username : <Link href="/start">{"Please login first"}</Link>}
                    <Tooltip
                        title={'Copy your username to clipboard'}><IconButton
                        onClick={() => {
                            navigator?.clipboard?.writeText(user?.username)
                        }} color="info">
                        <ContentCopy/>
                    </IconButton></Tooltip>
                </Typography>

                {/*<DeckSelect/>*/}

                <Typography>
                    {"Ready for a booster battle? Challenge another player!"}
                </Typography>

                {err ? err?.message : ""}

                <br/>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Opponent's User Name"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    onChange={x => setOpponent(x.target.value)} value={opponent}/>
                <br/>
                <Button disabled={started || opponent.trim() === ""} onClick={() => {
                    setStarted(true)
                    startQueryFor(user?.username, opponent, () => {
                        makePlay("created by " + user?.username + " at " + new Date().toISOString().substring(0, 16), undefined, () => {
                            //debug("user", user, "D:", user?.deck, "vs", enemy)

                            const arr = [user?.username, opponent]
                            arr.sort()
                            const [p1, p2] = arr

                            // debug("apiInitState", p1, ", ", p2)
                            fetch(apiInitState(p1, p2))
                                .then(x => x.json())
                                .then(json => {
                                    if (json.init) {
                                        debug("got init: ", json.init)
                                        setGameState(json.init)
                                        //setStarted(true)
                                    } else {
                                        setErr("No json init state found for " + p1 + ", " + p2)
                                    }
                                })
                        })
                    })
                }}>
                    {'Challenge user'}
                </Button>

                <InfoBox>
                    {"What is a booster battle?"}
                    <br/>
                    {"Play a round of HoH with 15 random cards from across history against your opponent."}
                </InfoBox>
            </Box>
        </Container>
        : <>
            {children(makePlay)}
            <div style={{
                color: "#fff",
                float: "left",
                position: "absolute",
                left: 33,
                fontSize: "90%",
                top: 0,
                width: 500
            }}>
                {bugLink}
                {!debugMode ? "" : <>
                    MSG={JSON.stringify(err)}
                    <br/>
                    T={JSON.stringify(gameState?.createdAt)}
                    <br/>
                    D={JSON.stringify(gameState)}</>}
            </div>
        </>)
}
