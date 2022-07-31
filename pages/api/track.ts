import {debugOn, log, now} from "../../src/utils"
import Discord, {ClientOptions} from 'discord.js'
import {DISCORD_BOT_TOKEN, TRIGGER_TRACKING_NUM} from "../../components/constants"
import {postWithUserFromSession} from "./vote"

let discordClient = undefined
let startupTime = now()

function withDiscordClient(cont) {
    if (discordClient)
        cont(discordClient)
    else
        setupDiscord(cont)
}

function setupDiscord(cont) {
    const client = new Discord.Client({
        intents: [
            Discord.Intents.FLAGS.GUILDS,
            Discord.Intents.FLAGS.GUILD_MESSAGES,
            Discord.Permissions.FLAGS.SEND_MESSAGES
        ]
    } as ClientOptions)

    client.once('ready', () => {
        log('Discord ready!')
        discordClient = client
        cont(client)
    })

    if (DISCORD_BOT_TOKEN()) {
        client.login(DISCORD_BOT_TOKEN())
        log("discord login...")
    } else {
        log("No DISCORD_BOT_TOKEN found in env")
    }
}

let alreadyNotifiedFor = {}

export function startupMessage() {
    log(
        "startupMessage",
        "computer,user,env",
        process.env.COMPUTERNAME,
        process.env.USERNAME,
        process.env.NODE_ENV
    )

    if (alreadyNotifiedFor[startupTime])
        return

    alreadyNotifiedFor[startupTime] = true

    sendToDiscord("HoH Server (" + process.env.NODE_ENV + ") started at " + startupTime
        // + ", computer: " + process.env.COMPUTERNAME + ", user: " + process.env.USERNAME
    )
}

function withApiChannel(cont) {
    withDiscordClient(client => {
        // TODO: or find by name? debug("channels ", client.channels)
        const id = TRIGGER_TRACKING_NUM()
        const apiChannel = client.channels.cache.get(id)
        if (apiChannel)
            cont(apiChannel)
        else
            throw new Error("not found: api-channel with id" + id)
    })
}

export function sendToDiscord(param, sendAnyway?: boolean) {
    withApiChannel(apiChannel => {
        if (debugOn && !sendAnyway) {
            log("would have sent to discord: " + param + " to channel named " + apiChannel?.name + " (id:" + apiChannel?.id + ")")
        } else {
            const callRes = apiChannel.send(param)
            log("Sent to discord: " + param + ", callRes " + callRes)
        }
    })
}

export default async function handler(req, res) {
    await postWithUserFromSession(req, async (code, invalid) => {
        res.status(code).json(invalid)
    }, async (user, body) => {
        let bodyOk = typeof body?.user === "string" && typeof body?.event === "string"
        if (!bodyOk) {
            res.status(400).json({
                user: "user must be a non-empty string, got " + body?.user,
                event: "event must be a non-empty string, got " + body?.event
            })
        } else {
            try {
                const {user, event} = body
                let param = "TRACKING " + user + ": " + event
                if (!alreadyNotifiedFor[param]) {
                    alreadyNotifiedFor[param] = true
                    sendToDiscord(param)
                }
                res.status(200).json({success: "sent discord message"})
            } catch (e) {
                let errPref = "error sending discord message "
                log(errPref, e)
                res.status(400).json({error: errPref + e})
            }
        }
    })
}
