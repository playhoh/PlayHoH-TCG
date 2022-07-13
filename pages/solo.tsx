import React, {Dispatch, SetStateAction, useEffect} from 'react'
import {Layout} from "../components/Layout"
import {HohApiWrapper} from "../src/client/clientApi"
import {changeUserData, currentUser, useUser} from "../src/client/userApi"
import {AtlassianDragAndDrop, AtlassianDragAndDropProps} from "../components/AtlassianDragAndDrop"
import {addTrackEntry, debug, parseUrlParams, shuffle, tempSeed, xmur3} from "../src/utils"
import {tutorialSteps} from "../components/tutorialSteps"
import {JoinDiscord} from "../components/JoinDiscord"
import {FadeInMessage} from "../components/FadeInMessage"
import {LoadingProgress} from "../components/LoadingProgress"
import {LoginFirst} from "../components/LoginFirst"
import {GameState, TutorialStepsData} from "../interfaces/gameTypes"
import {Maybe} from "../interfaces/baseTypes"
import {gameName} from '../components/constants'
import {tutorialDeck, tutorialHand, tutorialObjective} from '../src/cardData'

function loadItems(setItems, params?: any) {
    fetch(params.random ? "/api/cards/all" : "/api/tutorial").then(x => x.json()).then(cards => {
        let id = 0

        const r = xmur3(tempSeed())

        if (params.random)
            shuffle(cards)

        function card(name) {
            if (params.random) {
                let item = cards[id++ % cards.length]
                return {...item, name: item.key?.replace(/#/g, ""), id: id}
            }

            let find = cards.find(x => x.name === name)
            if (!find)
                throw new Error("not found: " + name + " in " + cards.map(x => x.name).join(", "))
            return {...find, id: id++}
        }

        let initTutorial = {
            phase: 4, // you main
            enemyScore: 0,
            yourScore: 0,
            enemyHand: tutorialHand().map(card),
            enemyDeck: tutorialDeck().map(card),
            enemyDiscard: [],
            enemyField: [],
            enemyResources: [],
            yourField: [],
            yourResources: [],
            yourHand: tutorialHand().map(card),
            yourDeck: tutorialDeck().map(card),
            yourDiscard: [],
            player1: "Bot",
            player2: "You",
            yourObjective: tutorialObjective(),
            enemyObjective: tutorialObjective()
        }

        setItems(initTutorial)
    })
}

type TutorialMessagesProps = {
    setGameState: Dispatch<SetStateAction<GameState>>,
    gameState: GameState,
    setHints: Dispatch<SetStateAction<Maybe<TutorialStepsData>>>
}

function TutorialMessages({setGameState, gameState, setHints}: TutorialMessagesProps) {
    const [step, setStep] = React.useState(0)
    const [audio, setAudio] = React.useState(false)
    const gotItButton = React.useRef<HTMLButtonElement>()
    const {user, userPointer} = useUser()
    //
    const [gameStateCOPY, setGameStateCOPY] = React.useState(gameState)

    React.useEffect(() => {
        setGameStateCOPY(gameState)
    }, [gameState])

    // closure variables are old, use newest instead, use state hook because it has the newest one always
    function withCurrentGameState(f: (g: GameState) => void) {
        setGameStateCOPY(currentValue => {
            f(currentValue)
            return currentValue
        })
    }

    const currentStep = tutorialSteps[step]

    function tutorialStepDoneTracking() {
        if (currentStep) {
            addTrackEntry({
                user: user?.username,
                event: "TUTORIAL step completed " + currentStep.id
                    + " (" + (step + 1) + "/" + tutorialSteps.length + ")"
            })
            if (currentStep.id === "endOfTutorial") {
                changeUserData(userPointer, data => ({...data, completedTutorial: true}))
            }
        }
    }

    React.useEffect(() => {
        if (!currentStep?.interactive && gotItButton?.current) {
            gotItButton.current.focus()
        }
    }, [gotItButton, currentStep?.interactive])

    function iter(i: number, arr) {
        if (i < arr.length) {
            withCurrentGameState(items => {
                arr[i](items)
            })
            setTimeout(() => iter(i + 1, arr), 500)
        } else if (i === arr.length) {
            setStep(x => x + 1)
        }
    }

    React.useEffect(() => {
        if (currentStep?.botBehavior) {
            debug("currentStep botBehavior function", !!currentStep?.botBehavior, "for step", currentStep?.id)
            const arr = currentStep?.botBehavior(setGameState, setHints)
            iter(0, arr)
        }
    }, [currentStep?.id])

    React.useEffect(() => {
        const intervalObj = setInterval(() => {
            withCurrentGameState(currentValue => {
                setStep(x => {
                    const currentStep = tutorialSteps[x]
                    const check = currentStep?.check
                    const res = check && check(currentValue)

                    if (check)
                        debug("tutorial step", currentStep?.id, " with check function yielded ", res)
                    if (res) {
                        tutorialStepDoneTracking()

                        let nextStepIdx = x + 1
                        setHints(tutorialSteps[nextStepIdx])
                        return nextStepIdx
                    }
                    return x
                })
            })
        }, 100)
        return () => clearInterval(intervalObj)
    }, [])

    return step >= tutorialSteps.length ? null :
        <>
            <div style={currentStep?.interactive ? {} : {
                position: "absolute",
                width: "100vw",
                height: "100vh", top: 0, left: 0,
                background: "#000000DD" // transparent black cover
            }}/>

            <div style={{position: "absolute", top: "20%", left: "20%", color: "#fff", fontSize: "200%"}}>
                {tutorialSteps.map((x, i) =>
                    step === i && x.text && <FadeInMessage
                        darkBg={currentStep?.interactive}
                        key={i} text={x.text} setAudio={setAudio} audio={audio}/>
                )}
            </div>

            {currentStep?.interactive ? "" :
                <div style={{position: "absolute", bottom: "20%", left: "20%", fontSize: "200%"}}>
                    <div>
                        {currentStep?.includeDiscordLink && <JoinDiscord/>}
                        {step + 1 < tutorialSteps.length &&
                            <div style={{marginTop: 12}}>
                                <button ref={gotItButton} autoFocus className="nextButton" onClick={() => {
                                    let newStepIdx = step + 1
                                    setStep(newStepIdx)

                                    const newStep = tutorialSteps[newStepIdx]
                                    setHints(newStep?.interactive ? newStep : undefined)

                                    tutorialStepDoneTracking()
                                }}>
                                    {'Got it!'}
                                </button>
                            </div>}
                    </div>
                </div>
            }
        </>
}

function TutorialLogic({params}) {
    const [user, setUser] = React.useState(undefined)
    const [needsAuth, setNeedsAuth] = React.useState(false)
    const [gameState, setGameState] = React.useState(undefined)
    const [hints, setHints] = React.useState(undefined)
    useEffect(() => {
        currentUser(setUser, setNeedsAuth)
        loadItems(setGameState, params)
    }, [])

    const props = {
        initYourHandRevealOverride: true,
        noRevealButtons: true,
        noManualScoring: true,
        noFlipButtons: true,
        tutorial: params.random === undefined,
        // initIsFlipped: true,
        user, gameState, setGameState, hints
    } as AtlassianDragAndDropProps
    return (
        needsAuth
            ? <LoginFirst/>
            : (user && gameState)
                ? <div>
                    <AtlassianDragAndDrop {...props}/>
                    {params.skip ? "" :
                        <TutorialMessages setGameState={setGameState} gameState={gameState} setHints={setHints}/>
                    }
                </div>
                : <LoadingProgress/>
    )
}

export default function TutorialPage({}) {
    const params = parseUrlParams()
    // debug("params data", params)

    return (
        <Layout title={gameName("Tutorial")} noCss gameCss>
            <HohApiWrapper>
                <TutorialLogic params={params}/>
            </HohApiWrapper>
        </Layout>
    )
}
