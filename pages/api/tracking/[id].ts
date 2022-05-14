import {debug, debugOn, fromBase64, log, now} from "../../../src/utils"
import Discord, {ClientOptions} from 'discord.js'
import {DISCORD_BOT_TOKEN} from "../../../components/constants"

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
        debug('Discord ready!')
        discordClient = client
        cont(client)
    })

    if (DISCORD_BOT_TOKEN)
        client.login(DISCORD_BOT_TOKEN)
}

let alreadyNotifiedFor = {}

export function startupMessage() {
    debug(
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
        const id = "962269863458533386"
        const apiChannel = client.channels.cache.get(id)
        if (apiChannel)
            cont(apiChannel)
        else
            throw new Error("not found: api-channel with id" + id)
    })
}

export function sendToDiscord(param) {
    withApiChannel(apiChannel => {
        if (debugOn) {
            debug("would have sent to discord: " + param + " to channel named " + apiChannel?.name + " (id:" + apiChannel?.id + ")")
            return
        } else {
            apiChannel.send(param)
        }
    })
}

export default function handler(req, res) {
    const id = req.url.substring(req.url.lastIndexOf("/") + 1)
    let obj = undefined
    try {
        obj = JSON.parse(fromBase64(id))
    } catch (e) {
        log("tracking data parse failed: " + e)
    }
    if (obj) {
        const {user, event, s} = obj
        let sum = 0;

        (user + "|" + event).split("").forEach(x => sum += x.charCodeAt(0))
        // debug("sum", sum, "s", s)

        let param = "TRACKING " + user + ": " + event
        if (sum === s) {
            if (!alreadyNotifiedFor[param]) {
                alreadyNotifiedFor[param] = true
                sendToDiscord(param)
            }
        } else {
            log("someone has tried to track data with a wrong checksum: given " + s + ", correct would be " + sum)
        }
    }

    res.status(200)
    res.json({ok: "ok"})
}
