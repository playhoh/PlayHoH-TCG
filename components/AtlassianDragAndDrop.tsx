import React, {Dispatch} from "react"
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd"
import useWindowDimensions from "../src/client/useWindowSize"
import {arrayMove, debug, lerp, toBase64} from "../src/utils"
import {CircularProgress, Link, Typography} from "@mui/material"
import {Feedback, FlipCameraAndroid} from "@mui/icons-material"
import {hohMail} from "./constants"
import {displayName} from "../src/client/userApi"
import {GameState, TutorialStepsData, Zone} from "../interfaces/gameTypes"
import {CardData} from "../interfaces/cardTypes"
import {hiresCardHeight, hiresCardWidth} from "../src/cardData"

const glitter = "url('./static/glitter.gif')"
const glitterFilter = "grayscale(100%) blur(1.2px)"

const areaGlitter = "no-repeat url('./static/sphericalwave.gif') 50% 50%"
const areaGlitterFilter = "grayscale(100%) blur(6px)"

export const imgUrlForName = name => {
    if (name === undefined)
        throw new Error("name was undefined")
    return "../api/svg/" + name.replace(/[ _]/g, '+')
}

export const imgUrlForCard = item => {
    if (!item.name)
        throw new Error("name was undefined for " + JSON.stringify(item, null, 2))

    let url = item.name
    if (item.physBuff || item.witsBuff)
        url += "?w=" + item.witsBuff + "&p=" + item.physBuff

    return imgUrlForName(url)
}

const hiddenCardPath = "./static/card-back.svg"
const transparentHoverColor = '#402030A0'
const transparentHintColor = '#4020AAA0'
const winNumber = 20

const zones = [
    {id: "enemyStats", isEnemy: true, isStats: true}, {
        id: "enemyHand",
        isHidden: true,
        isHand: true,
        isEnemy: true
    }, {id: "enemyDeck", isHidden: true, isEnemy: true, isDeck: true, showSingle: true}, {
        id: "enemyDiscard",
        isEnemy: true,
        isDiscard: true,
        showSingle: true
    }, {id: "enemyField", isEnemy: true, isField: true}, {
        id: "enemyResources",
        isHidden: true,
        isResource: true,
        isEnemy: true,
        showSingle: true
    }, {id: "yourStats", isStats: true}, {id: "yourHand", isHand: true}, {
        id: "yourDeck",
        isHidden: true,
        isDeck: true,
        showSingle: true
    }, {id: "yourDiscard", isDiscard: true, showSingle: true}, {id: "yourField", isField: true}, {
        id: "yourResources",
        isHidden: true,
        isResource: true,
        showSingle: true
    }
] as Zone[]

const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none', //padding: 0, margin: `0 ${grid}px 0 0`, cornerRadius: '13px',
    // change background colour if dragging
    // background: 'transparent',
    // styles we need to apply on draggables
    ...draggableStyle,
})

const getListStyle = (isDraggingOver) => ({
    background: isDraggingOver
        ? transparentHoverColor
        : 'transparent',
    display: 'flex',
    // overflow: 'hidden'
})

const phases = ["enemy draw", "enemy main", "enemy end", "you draw", "you main", "you end",]

function vibrate(state) {
    if (window.navigator.vibrate) {
        window.navigator.vibrate(state === "start" ? 10 : state === "end" ? 100 : 10)
    }
}

export const initGameState = {
    enemyHand: [],
    enemyDeck: [{name: "", id: "enemyDeckDummy"}],
    enemyDiscard: [],
    enemyField: [],
    enemyResources: [],
    yourField: [],
    yourResources: [],
    yourHand: [],
    yourDeck: [{name: "", id: "yourDeckDummy"}],
    yourDiscard: []
} as GameState

export const apiInitState = (user, enemy) => "../api/game/" + toBase64(JSON.stringify({
    user,
    enemy
}))

const StandBy = () => {
    return <div><CircularProgress/></div>
}

function recalc(list, listName) {
    if (listName.includes("Field")) {
        const buffersWits = list.filter(x => x.text?.includes("Other people get +1 [W]"))
        const buffersPhys = list.filter(x => x.text?.includes("Other people get +1 [P]"))
        debug("zone", listName, "list", list, "buffersPhys", buffersPhys, "buffersWits", buffersWits)

        return list.map(x =>
            buffersPhys.includes(x) || buffersWits.includes(x) ? x : ({
                ...x,
                physBuff: buffersPhys.length,
                witsBuff: buffersWits.length
            })
        )
    }
    return list.map(x => ({...x, physBuff: undefined, witsBuff: undefined}))
}

export type AtlassianDragAndDropProps = {
    user: any,
    gameState?: GameState,
    setGameState: Dispatch<GameState>,
    enemy?: any,
    noFlipButtons?: boolean,
    noRevealButtons?: boolean,
    noManualScoring?: boolean,

    initYourHandRevealOverride?: boolean,
    initEnemyHandRevealOverride?: boolean,
    initIsFlipped?: boolean,

    hints?: TutorialStepsData
}

export const AtlassianDragAndDrop = ({
                                         user,
                                         gameState,
                                         setGameState,
                                         enemy,
                                         noFlipButtons,
                                         noRevealButtons,
                                         noManualScoring,

                                         initYourHandRevealOverride,
                                         initEnemyHandRevealOverride,
                                         initIsFlipped,

                                         hints
                                     }: AtlassianDragAndDropProps) => {

    const phase = gameState.phase || 0

    const enemyScore = gameState.enemyScore || 0
    const setEnemyScore = enemyScore => setGameState({...gameState, enemyScore})

    const yourScore = gameState.yourScore || 0
    const setYourScore = yourScore => setGameState({...gameState, yourScore})

    //const [turn, setTurn] = React.useState(1)

    const started = !!gameState.player1

    const [yourHandRevealOverride, setYourHandRevealOverride] =
        React.useState<boolean>(initYourHandRevealOverride || false)

    const [enemyHandRevealOverride, setEnemyHandRevealOverride] =
        React.useState<boolean>(initEnemyHandRevealOverride || false)

    const [factor, setFactor] = React.useState(1) // TODO: later, mobile/tablet zoom etc
    const [enemyFlip, setEnemyFlip] = React.useState(initIsFlipped || false)

    const nextEnabled = started && (!hints || hints?.shouldPass)

    const nextButtonRef = React.useRef<HTMLButtonElement>()
    React.useEffect(() => {
        if (hints?.interactive && nextButtonRef?.current)
            nextButtonRef?.current?.focus()
    }, [nextButtonRef, hints?.id, hints?.interactive])

    const {height, width} = useWindowDimensions()

    const f2 = height / hiresCardHeight / 4.8
    const cardWidth = hiresCardWidth * f2 * factor
    const cardHeight = hiresCardHeight * f2 * factor

    function drawItem(item: CardData | undefined, zone: Zone, i: number, count: number, style?: any, drag?: boolean) {
        const stackingSize = cardWidth / 5
        const rota = zone.isEnemy ? -15 : 15
        const stack = zone.isResource || zone.isDeck || zone.isDiscard
        const deg = zone.isDiscard ? 5 : zone.isResource ? 90 : zone.isHand
            ? lerp(-rota, rota, (i + 1) / (count + 1)) : 0

        if (item && item.name === undefined)
            debug("item", item, " in ", zone)

        const showCard = item !== null && (zone.id === "enemyHand"
            ? enemyHandRevealOverride : zone.id === "yourHand" ? yourHandRevealOverride : !zone.isHidden)
        const backgroundImage = "url('" + (showCard ? imgUrlForCard(item) : hiddenCardPath) + "')"
        const transformOrigin = zone.isResource
            ? cardWidth * 0.7 + "px " + cardWidth * 0.7 + "px"
            : zone.isEnemy ? "top center" : "bottom center"
        const transform = deg !== 0 ? "rotate(" + deg + "deg)" : null

        const hintBackground =
            !drag && item !== undefined && hints && hints.name === item?.name && hints.from === zone.id

        return <div style={{
            width: stack ? stackingSize : cardWidth,
            height: cardHeight,
            transform: zone.isResource || zone.isDiscard ? transform : undefined,
            transformOrigin: zone.isResource || zone.isDiscard ? transformOrigin : undefined,
        }}>
            {!hintBackground ? "" : <div style={{
                background: glitter,
                borderRadius: 3,
                filter: glitterFilter,
                position: "absolute",
                width: stack ? stackingSize : cardWidth,
                height: cardHeight,
                transform: zone.isResource || zone.isDiscard ? transform : undefined,
                transformOrigin: zone.isResource || zone.isDiscard ? transformOrigin : undefined,
            }}/>}

            <div className={"grid-item-content" + style}
                 style={{
                     width: cardWidth,
                     height: cardHeight,
                     backgroundSize: cardWidth + "px " + cardHeight + "px",
                     backgroundImage,
                     verticalAlign: "bottom"
                 }}>
                {/*item.name
                +P{item?.physBuff}
                <br/>
                +W{item?.witsBuff}
                */}
            </div>
        </div>
    }

    const onDragStart = result => {
        if (!started)
            return
        vibrate("start")
    }

    const onDragEnd = result => {
        let moved = false
        // dropped outside the list
        if (!started || !result.destination) {
            return
        }

        const src = result.source.droppableId
        const srcList = [...gameState[src]]
        const dest = result.destination.droppableId
        const destList = [...gameState[dest]]

        const item = srcList[result.source.index]

        const correctHintedMove =
            hints
            && hints.from === src
            && hints.to === dest
            && hints.name === item?.name

        if (hints) {
            debug("Hinted move correct? ", correctHintedMove, " src ", src, " dest ", dest,
                " item", item, " hints ", hints)
            if (!correctHintedMove) {
                return
            }
        }

        if (src === dest) {
            moved = result.source.index !== result.destination.index
            arrayMove(destList, result.source.index, result.destination.index)
        } else {
            moved = true
            const [removed] = srcList.splice(result.source.index, 1)
            destList.splice(result.destination.index, 0, removed)
        }

        setGameState({...gameState, [src]: recalc(srcList, src), [dest]: recalc(destList, dest)})

        if (moved)
            vibrate("end")
    }

    function enemyDraw(state: GameState): GameState {
        const newState = {
            ...state, enemyHand: [...state.enemyHand], enemyDeck: [...state.enemyDeck]
        }
        const el = newState.enemyDeck.pop()
        if (el)
            newState.enemyHand.push(el)

        return newState
    }

    function youDraw(state: GameState): GameState {
        const newState = {
            ...state, yourHand: [...state.yourHand], yourDeck: [...state.yourDeck]
        }
        const el = newState.yourDeck.pop()
        if (el)
            newState.yourHand.push(el)

        return newState
    }

    function doLogic(state: GameState, enemyOrYou: string, logic: string, onWin?: Function) {
        if (!noManualScoring)
            return state

        let you = enemyOrYou === "you"
        const field = you ? state.yourField : state.enemyField
        const setter = you ? 'yourScore' : 'enemyScore'
        const old = you ? state.yourScore : state.enemyScore

        let value = 0
        if (logic === "endCountPower") {
            let s = 0
            field.forEach(x => s += (x?.phys ?? 0) + (x?.physBuff ?? 0))
            value = old + s
            state = {...state, [setter]: value}
        }
        if (logic === "endCountWits") {
            let s = 0
            field.forEach(x => s += (x?.wits ?? 0) + (x?.witsBuff ?? 0))
            value = old + s
            state = {...state, [setter]: value}
        }
        if (logic === "endStepObjectsDisc") {
            let s = 0
            const discard = you ? state.yourDiscard : state.enemyDiscard
            discard.forEach(x => s += x?.typeLine?.includes("Object") ? 1 : 0)
            value = old + s
            state = {...state, [setter]: value}
        }
        debug("scoring logic: " + logic + ", old: " + old + ", new: " + value, " setter was ", setter,
            "Check win: " + (you ? "you" : "enemy") + " = " + value + ">=" + winNumber + " " + (value >= winNumber))

        if (value >= winNumber) {
            (onWin || alert)(you ? "You won the match!" : "The enemy won the match.")
        }
        return state
    }

    function drawZone(zone: Zone) {
        const len = gameState[zone.id] ? gameState[zone.id].length : 0
        if (zone.isDeck || zone.isResource || zone.isDiscard) return <div style={{width: 12, minHeight: 12}}>
            {len === 1 ? null : drawItem(null, zone, 0, 0, len === 0 ? " lowOpacity" : "")}
            {len <= 1 ? "" : <span className="zoneCountText">({len})</span>}
        </div>

        if (zone.id === "yourField") return <>{!started ? <StandBy/> : ""}</>

        if (!zone.isStats) return null

        const enemy = zone.isEnemy
        const p = phases[phase] ?? ""
        const parts = p.split(" ")
        const isFlipped = !!enemy !== !enemyFlip
        const isEnemyTurn = !enemy || parts[0] === (isFlipped ? "you" : "enemy")
        const isYourTurn = enemy || parts[0] === (isFlipped ? "you" : "enemy")
        const turnOk = isEnemyTurn && isYourTurn

        const p1 = turnOk && parts[1] === "draw" ? " activePhase" : ""
        const p2 = turnOk && parts[1] === "main" ? " activePhase" : ""
        const p3 = turnOk && parts[1] === "end" ? " activePhase" : ""

        const nextPhase = phase >= phases.length - 1 ? 0 : phase + 1
        //const nextTurn = phase === 2 || phase === 5 ? turn + 1 : turn
        const {yourObjective, enemyObjective} = gameState

        const nextClick = () => {
            if (!gameState) {
                debug("gamestate undefined", gameState)
                return
            }

            let newState = gameState
            let nextPhaseStr = phases[nextPhase]

            if (nextPhaseStr === "you draw") {
                newState = youDraw(newState)
            }
            if (nextPhaseStr === "you end") {
                newState = doLogic(newState, "you", yourObjective?.logic)
            }
            if (nextPhaseStr === "enemy draw") {
                newState = enemyDraw(newState)
            }
            if (nextPhaseStr === "enemy end") {
                newState = doLogic(newState, "enemy", enemyObjective?.logic)
            }

            newState = {...newState, phase: nextPhase}

            setGameState(newState)

            //setTurn(nextTurn)
        }

        const content = <>
            <div className={"phaseBlock phase1" + p1}>Draw</div>
            <div className={"phaseBlock phase2" + p2}>Main</div>
            <div className={"phaseBlock phase3" + p3}>End</div>
        </>
        const feedbackLink =
            <Link href={"mailto:" + hohMail} variant="body2" title={'Feedback'}>
                <Typography variant="body2" style={{padding: 5, color: "#fff"}}>
                    <Feedback/>
                </Typography>
            </Link>

        const enemyFlipButton =
            <Link href="#" onClick={() => setEnemyFlip(!enemyFlip)} variant="body2" title={'Flip players'}>
                <Typography variant="body2" style={{padding: 5, color: "#fff"}}>
                    <FlipCameraAndroid/>
                </Typography>
            </Link>


        return <div key={zone.id} className={zone.id}>
            {enemy ? feedbackLink : content}

            <div className="phaseBlock life">
                <div>
                    {isFlipped
                        ? "P2/" + displayName(gameState?.player2 ?? "")
                        : "P1/" + displayName(gameState?.player1 ?? "")}
                    {turnOk ? ": " + "ACTIVE" : ""}

                </div>
                {!(yourObjective?.text || enemyObjective?.text) ? "" : <div>
                    <div className="objective">
                        {isFlipped ? enemyObjective?.text : yourObjective?.text}
                    </div>
                    {"■: " + (isFlipped ? enemyScore : yourScore) + "/" + winNumber}

                    {noManualScoring ? "" : <>&nbsp;| <span
                        onClick={() => isFlipped ? setEnemyScore(enemyScore - 1)
                            : setYourScore(yourScore - 1)}>&nbsp;-&nbsp;</span>
                        |
                        <span
                            onClick={() => isFlipped ? setEnemyScore(enemyScore + 1)
                                : setYourScore(yourScore + 1)}>&nbsp;+&nbsp;</span>
                    </>}

                    {noRevealButtons ? "" :
                        <>&nbsp;|
                            {isFlipped ?
                                <span onClick={() => // title="TECHNICALLY 'YOU'"
                                    setYourHandRevealOverride(() => !yourHandRevealOverride)}>
                                        &nbsp;👁️: {yourHandRevealOverride ? "Y" : "N"}&nbsp;</span>
                                : <span onClick={() => // title="TECHNICALLY 'ENEMY'"
                                    setEnemyHandRevealOverride(() => !enemyHandRevealOverride)}>
                                        &nbsp;👁️: {enemyHandRevealOverride ? "Y" : "N"}&nbsp;</span>}
                        </>
                    }
                </div>}
                {!enemy &&
                    <button
                        ref={nextButtonRef}
                        disabled={!nextEnabled}
                        autoFocus className="nextButton nextButtonPos"
                        style={{opacity: nextEnabled ? 1 : 0.7}}
                        onClick={nextClick}>
                        {'NEXT'}
                    </button>}
            </div>
            {enemy ? content : !noFlipButtons ? enemyFlipButton : ""}
        </div>
    }

    let extraStyle = (zone, items) => ({
        justifyContent: zone.isField || zone.isHand ? "center" : null,
        gap: zone.isField ? lerp(48, 4, items / 6) : null
    })

    return !process.browser ? null : <div className="container wrapper">
        <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
            {zones.map(zone =>
                !gameState[zone.id]
                    ? drawZone(zone)
                    : <Droppable key={zone.id} droppableId={zone.id} direction="horizontal">
                        {(provided, snapshot) => {
                            const className =
                                !enemyFlip ? zone.id
                                    : (zone.id.includes("your") ? zone.id.replace("your", "enemy")
                                        : zone.id.includes("enemy")
                                            ? zone.id.replace("enemy", "your") : zone.id)

                            const res = <div key="zoneContainer"
                                             ref={provided.innerRef}
                                             style={
                                                 {
                                                     ...getListStyle(snapshot.isDraggingOver),
                                                     ...extraStyle(zone, gameState[zone.id].length)
                                                 }}
                                             {...provided.droppableProps} className={className}>
                                {drawZone(zone)}
                                {gameState[zone.id]
                                    .filter((item, i) => item && (!zone.showSingle || i === 0))
                                    .map((item, index) => <Draggable key={"card" + item.id}
                                                                     draggableId={"card" + item.id}
                                                                     index={index}>
                                        {(provided, snapshot) => <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
                                            {drawItem(item, zone, index, gameState[zone.id].length,
                                                " zoom", snapshot.isDragging)}
                                        </div>}
                                    </Draggable>)}
                                {provided.placeholder}
                            </div>

                            const hintsRes =
                                !snapshot.isDraggingOver && hints?.to === zone.id
                                    ? <div key="hintsBg" style={{
                                        borderRadius: "40%",
                                        opacity: 0.4,
                                        background: areaGlitter,
                                        filter: areaGlitterFilter
                                    }} className={className}/>
                                    : undefined

                            return hintsRes ? [hintsRes, res] : res
                        }}
                    </Droppable>)}
        </DragDropContext>
    </div>
}
