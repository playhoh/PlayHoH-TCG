export type UserData = {
    username: string,
    email: string,
    emailVerified: boolean,
    displayName: string,
    deck?: string
    role: any,
    isAdmin: boolean,
    sessionToken: string,
    accounts?: string[]
}