export const MORALIS_APP_ID = () => process.env.NEXT_PUBLIC_MORALIS_APP_ID
export const MORALIS_SERVER_URL = () => process.env.NEXT_PUBLIC_MORALIS_SERVER_URL
export const MORALIS_MASTER_KEY = () => process.env.MORALIS_MASTER_KEY
export const TRIGGER_SECRET_KEY = () => process.env.TRIGGER_SECRET_KEY
export const TRIGGER_TRACKING_NUM = () => process.env.TRIGGER_TRACKING_NUM
export const FACE_API_URL = () => process.env.NEXT_PUBLIC_FACE_API_URL

export const DISCORD_BOT_TOKEN = () => process.env.DISCORD_BOT_TOKEN

// console.log("public env var: MORALIS_APP_ID is " + MORALIS_APP_ID())

export const SENDGRID_API_KEY = () => process.env.SENDGRID_API_KEY

export const SOME_MORALIS_USER = () => process.env.SOME_MORALIS_USER

export const SOME_MORALIS_USER_PASSWORD = () => process.env.SOME_MORALIS_USER_PASSWORD

export const hohMail = 'heroesofhistorytcg@gmail.com'

export const createIssueUrl = "https://github.com/playhoh/PlayHoH-TCG/issues/new"
    + "?assignees=&labels=&template=bug_report.md&title="

export const baseUrl = "https://playhoh.com"
export const discordUrl = "https://discord.gg/gyjZ9Fbkbm"

export const baseGameNameShort = "History of Humanity"
export const gameAbbrev = "HoH"

export const baseGameName = baseGameNameShort + " TCG"
export const gameVersion = gameAbbrev + " β v0.4"

export function gameName(beta: string) {
    return baseGameName + " " + beta
}

export function deployUrl(afterDomainSlash: string) {
    return baseUrl + "/" + afterDomainSlash
}
