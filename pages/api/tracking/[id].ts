import {debug, fromBase64, log} from "../../../src/utils";
import Discord, {ClientOptions, Permissions} from 'discord.js'
//const Discord = require('discord.js') // TODO discord js

//const webtoken = "A_bOIKl9-8iLmxtu41wskUmXJRjGQcifeYzsYakk71v0DD_aihDPxBCbQURjCvEcD6-W"
//const webhook = "https://discord.com/api/webhooks/962270495741472798/" + webtoken

const token = "Njk0NTYwNjAxODgzNTQxNjE0.XoNZ9w.l8wSO3lUPKkrmBgFLk-OX3ssRuQ"

let discordClient = undefined
let startupTime = new Date().toISOString().substring(0, 16).replace("T", " ") + "GMT"

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
        debug('discord Ready!');
        discordClient = client
        cont(client)
    })

    client.login(token)
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

    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
        || process.browser || alreadyNotifiedFor[startupTime])
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
        apiChannel.send(param)
    })
}

export default function handler(req, res) {
    const id = req.url.substring(req.url.lastIndexOf("/") + 1)
    let obj = undefined
    try {
        obj = JSON.parse(fromBase64(id))
    } catch (e) {
        log("tracking failed: " + e)
    }
    if (obj) {
        const {user, event, s} = obj
        let sum = 0;

        (user + "|" + event).split("").forEach(x => sum += x.charCodeAt(0))
        debug("sum", sum, "s", s)

        if (sum === s) {
            sendToDiscord("TRACKING " + user + ": " + event)
        }
    }

    res.status(200)
    res.json({ok: "ok"})
}
