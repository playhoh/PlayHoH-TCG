import React from "react"
import {baseGameNameShort, discordUrl, gameAbbrev} from "./constants"

type JoinDiscordProps = {
    simple?: boolean
}

export function JoinDiscord({simple}: JoinDiscordProps) {
    return <div id="join-discord" className={simple ? "discord-invite" : "discord-invite discord-invite-height"}>
        {!simple && <h5 className="discord-invite-text">
            {'You have been invited to join a server'}
        </h5>}
        <div className="discord-invite-body">
            <div className="discord-invite-image">
                <img src="/discord.svg" alt="Discord"/>
            </div>
            <div className="discord-invite-details">
                <div className="discord-invite-name">
                    {simple ? "The " + gameAbbrev + " Discord" : baseGameNameShort}
                </div>
            </div>
            <a className="discord-invite-join-button" target="_blank" rel="noreferrer" href={discordUrl}>
                {'Join'}
            </a>
        </div>
    </div>
}