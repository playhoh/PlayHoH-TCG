import React, {Dispatch, SetStateAction, useEffect} from 'react'
import Layout from "../components/Layout"
import {HohApiWrapper} from "../src/client/baseApi"
import {currentUser} from "../src/client/userApi"
import {AtlassianDragAndDrop} from "../components/AtlassianDragAndDrop"
import {debug} from "../src/utils"
import {tutorialSteps} from "../components/tutorialSteps"
import {JoinDiscord} from "../components/JoinDiscord"
import {FadeInMessage} from "../components/FadeInMessage"
import {LoadingProgress} from "../components/LoadingProgress"
import {LoginFirst} from "../components/LoginFirst"
import {GameState, TutorialStepsData} from "../interfaces/gameTypes"
import {Maybe} from "../interfaces/baseTypes"

function loadItems(setItems) {
    fetch("/api/tutorial").then(x => x.json()).then(beta1Json => {
        let id = 0

        function card(name) {
            let find = beta1Json.find(x => x.name === name)
            if (!find)
                throw new Error("not found: " + name + " in " + beta1Json.map(x => x.name).join(", "))
            return {...find, id: id++}
        }

        const tutorialHand = () =>
            ["Rain-in-the-Face", "Cochise", "Chief Joseph"].map(card)

        const tutorialDeck = () => ["Wahunsonacock", "War Bonnet", "Geronimo",
            "Tomahawk", "Hiawatha", "Makataimeshekiakiak",
            "Fire Ritual", "Wiigwaasabak", "Rite Inscription",
            "Tashunca-Uitco", "Tipi"].map(card)

        const objective = {text: "End: You get ■ for each 💪 of your people.", logic: "endCountPower"}
        let initTutorial = {
            phase: 4, // you main
            enemyScore: 0,
            yourScore: 0,
            enemyHand: tutorialHand(),
            enemyDeck: tutorialDeck(),
            enemyDiscard: [],
            enemyField: [],
            enemyResources: [],
            yourField: [],
            yourResources: [],
            yourHand: tutorialHand(),
            yourDeck: tutorialDeck(),
            yourDiscard: [],
            player1: "You",
            player2: "Bot",
            yourObjective: objective,
            enemyObjective: objective
        }

        setItems(initTutorial)
    })
}

const startStep = 0

type TutorialMessagesProps = {
    setItems: Dispatch<SetStateAction<GameState>>,
    items: GameState,
    setHints: Dispatch<SetStateAction<Maybe<TutorialStepsData>>>
}

function TutorialMessages({setItems, items, setHints}: TutorialMessagesProps) {
    const [step, setStep] = React.useState(startStep)
    const [audio, setAudio] = React.useState(false)
    const [items2, setItems2] = React.useState(items)
    const gotItButton = React.useRef<HTMLButtonElement>()
    React.useEffect(() => {
        setItems2(items)
    }, [items])

    const currentStep = tutorialSteps[step]
    React.useEffect(() => {
        if (!currentStep?.interactive && gotItButton?.current) {
            gotItButton.current.focus()
        }
    }, [gotItButton, currentStep?.interactive])

    function iter(i: number, arr) {
        if (i < arr.length) {
            // closure variables are old, use newest instead
            setItems2(items => {
                arr[i](items)
                return items
            })
            setTimeout(() => iter(i + 1, arr), 500)
        } else if (i === arr.length) {
            setStep(x => x + 1)
        }
    }

    React.useEffect(() => {
        if (currentStep?.botBehavior) {
            debug("currentStep botBehavior function", !!currentStep?.botBehavior, "for step", currentStep?.id)
            const arr = currentStep?.botBehavior(setItems, setHints)
            iter(0, arr)
        }
    }, [currentStep?.id])

    React.useEffect(() => {
        const i = setInterval(() => {
            // closure variables are old, use newest instead
            setItems2(items => {
                setStep(x => {
                    const currentStep = tutorialSteps[x]
                    const check = currentStep?.check
                    const res = check && check(items)

                    if (check)
                        debug("tutorial step", currentStep?.id, " with check function yielded ", res)
                    if (res) {
                        return x + 1
                    }
                    return x
                })
                return items
            })
        }, 100)
        return () => clearInterval(i)
    }, [])

    return step >= tutorialSteps.length ? null :
        <>
            <div style={currentStep?.interactive ? {} : {
                position: "absolute",
                width: "100vw",
                height: "100vh", top: 0, left: 0,
                background: "#000000DD"
            }}/>

            <div style={{position: "absolute", top: "20%", left: "20%", color: "#fff", fontSize: "200%"}}>
                {tutorialSteps.map((x, i) =>
                    step === i && x.text && <FadeInMessage key={i} text={x.text} setAudio={setAudio} audio={audio}/>
                )}
            </div>

            {currentStep?.interactive ? "" :
                <div style={{position: "absolute", bottom: "20%", left: "20%", fontSize: "200%"}}>
                    <div>
                        {currentStep?.includeDiscordLink && <JoinDiscord/>}
                        <div style={{marginTop: 12}}>
                            <button ref={gotItButton} autoFocus className="nextButton" onClick={() => {
                                setStep(step + 1)
                                const newStep = tutorialSteps[step + 1]
                                setHints(newStep?.interactive ? newStep : undefined)
                            }}>
                                {'Got it!'}
                            </button>
                        </div>
                    </div>
                </div>
            }
        </>
}

function TutorialLogic() {
    const [user, setUser] = React.useState(undefined)
    const [needsAuth, setNeedsAuth] = React.useState(false)
    const [gameState, setGameState] = React.useState(undefined)
    const [hints, setHints] = React.useState(undefined)
    useEffect(() => {
        currentUser(setUser, setNeedsAuth)
        loadItems(setGameState)
    }, [])

    const props = {
        initHandRevealOverride2: true,
        noRevealButtons: true,
        noManualScoring: true,
        noFlipButtons: false,
        user, gameState, setGameState, hints
    }
    return (
        needsAuth
            ? <LoginFirst/>
            : (user && gameState)
                ? <div>
                    <AtlassianDragAndDrop {...props}/>
                    <TutorialMessages setItems={setGameState} items={gameState} setHints={setHints}/>
                </div>
                : <LoadingProgress/>
    )
}

export default function TutorialPage({}) {
    const [browser, setBrowser] = React.useState(false)
    useEffect(() => {
        setBrowser(process.browser)
    }, [])

    return (
        <Layout title="Heroes of History TCG Beta" noCss gameCss>
            <HohApiWrapper>
                {!browser ? "" : <TutorialLogic/>}
            </HohApiWrapper>
        </Layout>
    )
}
