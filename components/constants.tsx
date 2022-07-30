export const MORALIS_APP_ID = () => process.env.NEXT_PUBLIC_MORALIS_APP_ID
export const MORALIS_SERVER_URL = () => process.env.NEXT_PUBLIC_MORALIS_SERVER_URL
export const MORALIS_MASTER_KEY = () => process.env.MORALIS_MASTER_KEY
export const TRIGGER_SECRET_KEY = () => process.env.TRIGGER_SECRET_KEY

export const DISCORD_BOT_TOKEN = () => process.env.DISCORD_BOT_TOKEN

// console.log("public env var: MORALIS_APP_ID is " + MORALIS_APP_ID())

export const SENDGRID_API_KEY = () => process.env.SENDGRID_API_KEY

export const SOME_MORALIS_USER = () => process.env.SOME_MORALIS_USER

export const SOME_MORALIS_USER_PASSWORD = () => process.env.SOME_MORALIS_USER_PASSWORD

export const hohMail = 'heroesofhistorytcg@gmail.com'

export const baseUrl = "https://playhoh.com"
export const baseGameNameShort = "Heroes of History"
export const baseGameName = "Heroes of History TCG"
export const gameVersion = "HoH β v0.1"

export function gameName(beta: string) {
    return baseGameName + " " + beta
}

export function deployUrl(afterDomainSlash: string) {
    return baseUrl + "/" + afterDomainSlash
}
