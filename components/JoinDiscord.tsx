import React from "react"
import {baseGameNameShort} from "./constants"

type JoinDiscordProps = {
    simple?: boolean
}

export function JoinDiscord({simple}: JoinDiscordProps) {
    return <div id="join-discord" className={simple ? "discord-invite" : "discord-invite discord-invite-height"}>
        {!simple && <h5 className="discord-invite-text">You have been invited to join a server</h5>}
        <div className="discord-invite-body">
            <div className="discord-invite-image">
                <img src="/discord.svg" alt="Discord"/>
            </div>
            <div className="discord-invite-details">
                <div className="discord-invite-name">
                    {simple ? "The HoH Discord" : baseGameNameShort}
                </div>
            </div>
            <a className="discord-invite-join-button" target="_blank" rel="noreferrer"
               href="https://discord.gg/gyjZ9Fbkbm">
                Join
            </a>
        </div>
    </div>
}