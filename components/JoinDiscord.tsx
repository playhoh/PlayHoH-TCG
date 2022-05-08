import React from "react"

export function JoinDiscord() {
    return <div id="join-discord" className="discord-invite">
        <h5 className="discord-invite-text">You have been invited to join a server</h5>
        <div className="discord-invite-body">
            <div className="discord-invite-image">
                <img src="/discord.svg" alt="Discord"/>
            </div>
            <div className="discord-invite-details">
                <h3 className="discord-invite-name">
                    Heroes of History
                </h3>
            </div>
            <a className="discord-invite-join-button" target="_blank" rel="noreferrer"
               href="https://discord.gg/gyjZ9Fbkbm">
                Join
            </a>
        </div>
    </div>
}