import React from 'react'
import {hasSpeechApi, say} from "../src/client/speechApi"
import {IconButton} from "@mui/material"
import {Headphones, HeadsetOff} from "@mui/icons-material"

interface FadeInMessageProps {
    text: string,
    timeout?: number,
    lookahead?: number,
    audio: boolean,
    setAudio: Function
}

export function FadeInMessage({text, timeout, lookahead, audio, setAudio}: FadeInMessageProps) {
    const [t, setT] = React.useState(0)
    const [canceller, setCanceller] = React.useState(undefined)

    React.useEffect(() => {
        const i = setInterval(() => {
            setT(x => {
                if (x >= text.length) {
                    clearInterval(i)
                    return x
                } else {
                    return x + 1
                }
            })
        }, timeout || 30)

        if (audio && hasSpeechApi()) {
            setCanceller(say(text))
        }

        return () => {
            clearInterval(i)
            if (canceller?.cancel) {
                canceller.cancel()
            }
        }
    }, [])

    return <div>
        {hasSpeechApi() && <IconButton onClick={() => {
            if (canceller?.cancel) {
                canceller.cancel()
            }

            if (!audio)
                setCanceller(say(text))

            setAudio(!audio)
        }} color='primary'>{!audio ? <Headphones/> : <HeadsetOff/>}</IconButton>}
        {text.substring(0, t).split("\n").map((x, i) => <div key={i}>
            {x}&nbsp;&nbsp;&nbsp;&nbsp;
        </div>)}
    </div>
}
