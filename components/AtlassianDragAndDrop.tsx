import React, {Dispatch} from "react"
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd"
import useWindowDimensions from "../src/client/useWindowSize"
import {arrayMove, capitalize, debug, lerp, toBase64} from "../src/utils"
import {CircularProgress, IconButton, Link, Typography} from "@mui/material"
import {Add, Feedback, InfoOutlined, Menu, Remove} from "@mui/icons-material"
import {gameVersion, hohMail} from "./constants"
import {displayName} from "../src/client/userApi"
import {GameState, TutorialStepsData, Zone, ZoneId} from "../interfaces/gameTypes"
import {Card} from "../interfaces/cardTypes"
import {hiddenCardPath, hiresCardHeight, hiresCardWidth} from "../src/cardData"
import {Maybe} from "../interfaces/baseTypes"
import {SimpleBadge} from "./SimpleBadge"
import {VotingDialog} from "./VotingDialog"
import {BalanceSvg} from "./BalanceSvg"
import {feedbackFunction} from "../src/client/cardApi"
import {SimpleTooltip} from "./SimpleTooltip"
import {getAllInObj} from "../src/dbpediaUtils"
import {GameMenuDialog} from "./GameMenuDialog"

const glitter = "url('./static/glitter.gif')"
const glitterFilter = "grayscale(100%) blur(1.2px)"

const areaGlitter = "no-repeat url('./static/sphericalwave.gif') 50% 50%"
const areaGlitterFilter = "grayscale(100%) blur(6px)"

export const imgUrlForName = (lastPart: string, tutorial?: boolean) => {
    if (lastPart === undefined)
        throw new Error("name was undefined")

    return (tutorial ? "../api/svg/" : "../api/img/") + lastPart
}

export const imgUrlForCard = (item, tutorial?: boolean) => {
    if (!item.name)
        throw new Error("name was undefined for " + JSON.stringify(item, null, 2))

    let lastPart = tutorial
        ? item.name.replace(/[ _]/g, '+')
        : item.key?.replace(/#/g, "") || "item key was undefined for " + item.name
    if (item.physBuff || item.witsBuff)
        lastPart += "?w=" + item.witsBuff + "&p=" + item.physBuff

    return imgUrlForName(lastPart, tutorial)
}

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
        id: "enemyField",
        isEnemy: true,
        isField: true
    }, {
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
    }, {id: "yourField", isField: true}, {
        id: "yourResources",
        isHidden: true,
        isResource: true,
        showSingle: true
    },
    // discard as last for z-ordering
    {id: "yourDiscard", isDiscard: true, showSingle: true}, {
        id: "enemyDiscard",
        isEnemy: true,
        isDiscard: true,
        showSingle: true
    }
] as Zone[]

type ZoneLookup = Record<ZoneId, Maybe<ZoneId>>
const nextZoneIdFor = {
    yourDiscard: "yourHand",
    yourHand: "yourField",
    yourResources: "yourDiscard",
    yourDeck: "yourHand",
    yourField: "yourResources",

    enemyDiscard: "enemyHand",
    enemyHand: "enemyField",
    enemyResources: "enemyDiscard",
    enemyDeck: "enemyHand",
    enemyField: "enemyResources"
} as ZoneLookup

const prevZoneIdFor = {
    yourDiscard: "yourHand",
    yourHand: "yourDeck",
    yourResources: "yourHand",
    yourDeck: "yourHand",
    yourField: "yourHand",

    enemyDiscard: "enemyHand",
    enemyHand: "enemyDeck",
    enemyResources: "enemyHand",
    enemyDeck: "enemyHand",
    enemyField: "enemyHand"
} as ZoneLookup

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
    enemyDeck: [{name: "", id: "enemyDeckDummy"} as any],
    enemyDiscard: [],
    enemyField: [],
    enemyResources: [],
    yourField: [],
    yourResources: [],
    yourHand: [],
    yourDeck: [{name: "", id: "yourDeckDummy"} as any],
    yourDiscard: []
} as GameState

export const apiInitState = (user, enemy) => "../api/game/" + toBase64(JSON.stringify({
    user,
    enemy
}))

const StandBy = () => {
    return <div style={{margin: "0 auto"}}><CircularProgress/></div>
}

function recalc(list, listName) {
    if (listName.includes("Field")) {
        const buffersWits = list.filter(x => x.text?.includes("Your other people get +1 [W]"))
        const buffersPhys = list.filter(x => x.text?.includes("Your other people get +1 [P]"))
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
    noFlipButtons?: boolean,
    noRevealButtons?: boolean,
    noManualScoring?: boolean,

    initYourHandRevealOverride?: boolean,
    initEnemyHandRevealOverride?: boolean,
    initIsFlipped?: boolean,

    hints?: TutorialStepsData
    tutorial?: boolean
}

const ItemsInZone = ({
                         provided,
                         snapshot,
                         extraStyle,
                         zone,
                         itemsInZone,
                         className,
                         drawZone,
                         drawItem,
                         zoomClass,
                         Draggable2
                     }) => <div key="zoneContainer"
                                ref={provided.innerRef}
                                style={
                                    {
                                        ...getListStyle(snapshot.isDraggingOver),
                                        ...extraStyle(zone, itemsInZone.length)
                                    }}
                                {...provided.droppableProps} className={className}>
    {drawZone(zone)}
    {itemsInZone
        .filter((item, i) => item && (!zone.showSingle || i === 0))
        .map((item, index) => <Draggable2
            key={"card" + item.id}
            draggableId={"card" + item.id}
            index={index}
            zone={zone} item={item}>
            {(provided, snapshot) => <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={getItemStyle(snapshot.isDragging, provided.draggableProps?.style)}>
                {drawItem(item, zone, index, itemsInZone.length, zoomClass, snapshot.isDragging)}
            </div>}
        </Draggable2>)}
    {provided.placeholder}
</div>


export const AtlassianDragAndDrop = ({
                                         user,
                                         gameState,
                                         setGameState,
                                         noFlipButtons,
                                         noRevealButtons,
                                         noManualScoring,
                                         initYourHandRevealOverride,
                                         initEnemyHandRevealOverride,
                                         initIsFlipped,
                                         hints,
                                         tutorial
                                     }: AtlassianDragAndDropProps) => {

    const animation = user.data?.animation !== false
    debug("animation", animation, " from ", user.data)

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

    const [flavourInfo, setFlavourInfo] = React.useState<any>({})

    const [factor, setFactor] = React.useState(1)
    // TODO: later, mobile/tablet zoom etc

    const [enemyFlip, setEnemyFlip] = React.useState(initIsFlipped ?? false)
    const [isShowingInfo, setShowingInfo] = React.useState(initIsFlipped ?? false)
    const [isVoting, setVoting] = React.useState(true)
    const [isMenu, setMenu] = React.useState(initIsFlipped ?? false)
    const [votingDialogCard, setVotingDialog] = React.useState(undefined)

    const nextEnabled = started && (!hints || hints?.shouldPass)
    const feedbackFunctionForData = feedbackFunction(user)
    const nextButtonRef = React.useRef<HTMLButtonElement>()
    React.useEffect(() => {
        if (hints?.interactive && nextButtonRef?.current)
            nextButtonRef?.current?.focus()
    }, [nextButtonRef, hints?.id, hints?.interactive])

    /*
    TODO: idea: dont transfer comments and stuff on interaction, only keys in zones, then have another data container
    const cardsForFlavour = toSet([...gameState.enemyField.map(x => x.name),
        ...gameState.yourField.map(x => x.name),
        ...gameState.yourHand.map(x => x.name)])

    React.useEffect(() => {
        if (cardsForFlavour) {
            //let card = cardsForFlavour[0]
        }
    }, [cardsForFlavour])*/

    function getFlavour(item: Card | undefined) {
        return item?.comment // flavourInfo[name]
    }

    // TODO: idea: fetch comment (background information) on the fly
    function fetchFlavour(item: Card | undefined) {
        const name = item.name
        if (name && flavourInfo[name] === undefined) {
            setFlavourInfo(x => ({...x, [name]: ""}))
            setTimeout(() => fetch("https://dbpedia.org/data/" + name.replace(/ /g, "_") + ".json")
                .then(x => x.json()).then(json => {
                    const unescaped = getAllInObj(json, "rdf-schema#comment")
                    if (unescaped)
                        setFlavourInfo(x => ({...x, [name]: unescaped}))
                }), 10)
        }
    }

    const {height, width} = useWindowDimensions()

    const f2 = height / hiresCardHeight / 4.8
    const cardWidth = hiresCardWidth * f2 * factor
    const cardHeight = hiresCardHeight * f2 * factor

    function drawItem(item: Card | undefined, zone: Zone, i: number, count: number, style?: any, drag?: boolean) {
        const stackingSize = cardWidth / 5
        const rota = zone.isEnemy ? -15 : 15
        const stack = zone.isResource || zone.isDeck || zone.isDiscard
        const deg = zone.isDiscard ? 5 : zone.isResource ? 90 : zone.isHand
            ? lerp(-rota, rota, (i + 1) / (count + 1)) : 0

        if (item && item.name === undefined)
            debug("item", item, " in ", zone)

        const showCard = item !== null && (zone.id === "enemyHand"
            ? enemyHandRevealOverride : zone.id === "yourHand" ? yourHandRevealOverride : !zone.isHidden)
        const backgroundImage = "url('" + (showCard ? imgUrlForCard(item, tutorial) : hiddenCardPath) + "')"
        const transformOrigin = zone.isResource
            ? cardWidth * 0.7 + "px " + cardWidth * 0.7 + "px"
            : zone.isEnemy ? "top center" : "bottom center"
        const transform = deg !== 0 ? "rotate(" + deg + "deg)" : null

        const hintBackground =
            !drag && item !== undefined && hints && hints.name === item?.name && hints.from === zone.id
        const img =
            <div className={"grid-item-content" + style}
                 style={{
                     width: cardWidth,
                     height: cardHeight,
                     backgroundSize: cardWidth + "px " + cardHeight + "px",
                     backgroundImage,
                     verticalAlign: "bottom"
                 }}>
            </div>

        return <div
            onContextMenu={(e) => {
                if (!animation) {
                    debug("context menu on card" + item.name)
                    moveToNextZone(item, zone, prevZoneIdFor)
                    e.preventDefault()
                    return false
                }
            }}
            onMouseEnter={() => showCard && isShowingInfo && getFlavour(item)}
            style={{
                width: stack ? stackingSize : cardWidth,
                height: zone.isResource ? cardWidth : cardHeight,
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

            {showCard ? <SimpleTooltip placement="right" className="votingContainer" title={
                isShowingInfo && getFlavour(item) && <div className="commentTooltip">
                    {isVoting ?
                        <SimpleBadge badgeContent={
                            <IconButton title={"Feedback for this card"}
                                className="votingButton" color="info" style={{padding: 4}}
                                onClick={() => setVotingDialog(item)}>
                                <BalanceSvg/>
                            </IconButton>}>
                            {isShowingInfo && getFlavour(item)}
                        </SimpleBadge>
                        : (isShowingInfo && getFlavour(item))}
                </div>}>
                {img}
            </SimpleTooltip> : img}

        </div>
    }

    const onDragStart = () => {
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

        const list = logic === "endStepObjectsDisc"
            ? you ? state.yourDiscard : state.enemyDiscard
            : field

        const getter = logic === "endCountPower"
            ? x => (x?.phys ?? 0) + (x?.physBuff ?? 0)
            : logic === "endCountWits"
                ? x => (x?.wits ?? 0) + (x?.witsBuff ?? 0)
                : logic === "endStepObjectsDisc"
                    ? x => x?.typeLine?.includes("Object") ? 1 : 0
                    : () => 0

        let sum = 0
        list.forEach(x => sum += parseFloat(getter(x)))
        const value = parseFloat(old as any) + sum
        state = {...state, [setter]: value}

        debug("scoring logic: " + logic + ", old: " + old + ", new: " + value, " setter was ", setter,
            "Check win: " + (you ? "you" : "enemy") + " = " + value + ">=" + winNumber + " " + (value >= winNumber))

        if (value >= winNumber) {
            (onWin || alert)(you ? "You won the match!" : "The enemy won the match.")
        }
        return state
    }

    function drawZone(zone: Zone) {
        const itemsInZone = gameState[zone.id]

        const len = itemsInZone ? itemsInZone.length : 0
        if (zone.isDeck || zone.isResource || zone.isDiscard) return <div style={{width: 12, height: 12}}>
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

        const feedbackLink = ""

        const feedbackMailLink =
            <Link href={"mailto:" + hohMail} variant="body2" title={'Feedback'}>
                <Typography variant="body2" style={{padding: 5, color: "#fff"}}>
                    <Feedback/>
                </Typography>
            </Link>

        /*const enemyFlipButton =
            <Link href="#" onClick={() => setEnemyFlip(!enemyFlip)} variant="body2" title={'Flip players'}>
                <Typography variant="body2" style={{padding: 5, color: "#fff"}}>
                    <FlipCameraAndroid/>
                </Typography>
            </Link>*/

        const infoButton =
            <IconButton onClick={() => setShowingInfo(!isShowingInfo)} color={isShowingInfo ? "primary" : "info"}
                        title={'Show card flavour on mouse over'}>
                <InfoOutlined/>
            </IconButton>

        const voteButton =
            <IconButton onClick={() => setVoting(!isVoting)} color={isVoting ? "primary" : "info"}
                        title={'Show card voting option'}>
                <BalanceSvg/>
            </IconButton>

        const menuButton =
            <IconButton onClick={() => setMenu(!isMenu)} color="info"
                        title={'Show menu'}>
                <Menu/>
            </IconButton>

        const flipButtonOrNot = !noFlipButtons ? <>{menuButton} <span
            style={{fontSize: "50%", opacity: 0.2}}>{gameVersion}</span></> : ""

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
                    <div className={"objective" + (isFlipped ? " yourObjective" : " enemyObjective")}>
                        {isFlipped ? yourObjective?.text : enemyObjective?.text}
                    </div>
                    {"■: " + (isFlipped ? yourScore : enemyScore) + "/" + winNumber}
                    {!enemy || noManualScoring ? "" : <span className={isFlipped ? "yourScore" : "enemyScore"}>&nbsp;|
                        <span onClick={() => isFlipped ? yourScore > 0 && setYourScore(yourScore - 1)
                            : enemyScore > 0 && setEnemyScore(enemyScore - 1)}>&nbsp;-&nbsp;</span>
                        | <span onClick={() => isFlipped ? setYourScore(yourScore + 1)
                            : setEnemyScore(enemyScore + 1)}>&nbsp;+&nbsp;</span>
                    </span>}
                    {noRevealButtons ? "" :
                        <>&nbsp;|
                            {isFlipped ?
                                <span className="yourHandReveal" onClick={() => // title="TECHNICALLY 'YOU'"
                                    setYourHandRevealOverride(() => !yourHandRevealOverride)}>
                                        &nbsp;👁️: {yourHandRevealOverride ? "Y" : "N"}&nbsp;</span>
                                : <span className="enemyHandReveal" onClick={() => // title="TECHNICALLY 'ENEMY'"
                                    setEnemyHandRevealOverride(() => !enemyHandRevealOverride)}>
                                        &nbsp;👁️: {enemyHandRevealOverride ? "Y" : "N"}&nbsp;</span>}
                        </>
                    }
                </div>}

                {!enemy &&
                    <div className="nextButtonPos">
                        <button
                            ref={nextButtonRef}
                            disabled={!nextEnabled}
                            autoFocus className="nextButton"
                            style={{opacity: nextEnabled ? 1 : 0.7}}
                            onClick={nextClick}>
                            {'NEXT'}
                        </button>
                        <br/>
                        <div className={isFlipped ? "yourScore" : "enemyScore"} style={{fontSize: "200%"}}>
                            {noManualScoring ? "" : <>
                                <IconButton color="info"
                                            onClick={() => isFlipped ? yourScore > 0 && setYourScore(yourScore - 1)
                                                : enemyScore > 0 && setEnemyScore(enemyScore - 1)}><Remove/></IconButton>
                                <span style={{opacity: 0.5}}>|</span>
                                <IconButton color="info"
                                            onClick={() => isFlipped ? setYourScore(yourScore + 1)
                                                : setEnemyScore(enemyScore + 1)}><Add/></IconButton>
                            </>}
                        </div>
                    </div>}


            </div>
            {enemy ? content : flipButtonOrNot}
        </div>
    }

    let extraStyle = (zone, items) => ({
        justifyContent: zone.isField || zone.isHand ? "center" : null,
        gap: zone.isField ? lerp(48, 4, items / 6) : null
    })

    const Droppable2 = p => animation ? <Droppable {...p} /> : p.children({}, {})

    function moveToNextZone(item: Card, zone: Zone, zoneLookupObj: ZoneLookup) {
        const fromZoneId = zone.id
        // debug("card/item", p.item, " in ", fromZoneId)

        const sourceList = gameState[fromZoneId]
        const nextListId = zoneLookupObj[fromZoneId]
        if (nextListId) {
            // const targetListId = gameState[nextListId]
            const index = sourceList.indexOf(item)
            // debug("from ", fromZoneId, " to ", nextListId, " itemIdx ", index, " in ", sourceList)
            onDragEnd({
                source: {droppableId: fromZoneId, index: index},
                destination: {droppableId: nextListId, index: 0}
            })
        }
    }

    const Draggable2 = p => animation ? <Draggable {...p} /> :
        <div onClick={() => {
            moveToNextZone(p.item, p.zone, nextZoneIdFor)
        }} {...{p, children: undefined}}>{p.children({}, {})}</div>

    return !process.browser ? null : <div className="container wrapper">
        {/*onContextMenu=(e) => {
           debug("context menu on background")
        //e.stopPropagation() //preventDefault();
        }*/}
        <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
            {zones.map(zone =>
                !gameState[zone.id]
                    ? drawZone(zone)
                    : <Droppable2 key={zone.id} droppableId={zone.id} direction="horizontal">
                        {(provided, snapshot) => {
                            const className =
                                !enemyFlip ? zone.id
                                    : (zone.id.includes("your") ? zone.id.replace("your", "enemy")
                                        : zone.id.includes("enemy")
                                            ? zone.id.replace("enemy", "your") : zone.id)
                            const zoomClass = " zoom zoom" + capitalize(className)

                            const res = <ItemsInZone {...{
                                provided,
                                snapshot,
                                extraStyle,
                                zone,
                                itemsInZone: gameState[zone.id],
                                className,
                                drawZone,
                                drawItem,
                                zoomClass,
                                Draggable2
                            }} />

                            const hintsRes =
                                !snapshot.isDraggingOver && hints?.to === zone.id
                                    ? <div key="hintsBg" style={{ // this stuff is WIP, better GIFS
                                        borderRadius: "40%",
                                        opacity: 0.4,
                                        background: areaGlitter,
                                        filter: areaGlitterFilter
                                    }} className={className}/>
                                    : undefined

                            return hintsRes ? [hintsRes, res] : res
                        }}
                    </Droppable2>)}
            <VotingDialog card={votingDialogCard}
                          feedbackFunction={feedbackFunctionForData}
                          closeFunction={() => setVotingDialog(undefined)}/>
            <GameMenuDialog open={isMenu}
                            concede={() => setEnemyScore(winNumber)}
                            isShowingInfo={isShowingInfo}
                            setShowingInfo={setShowingInfo}
                            closeFunction={() => setMenu(false)}/>
        </DragDropContext>
    </div>
}
