import {NextApiRequest, NextApiResponse} from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = req.url.substring(req.url.lastIndexOf("/") + 1)
    const success = true
    // TODO maybe implement email verifcation yourself, use verifyid from _User table
    res.status(200)
    res.setHeader('Content-Type', 'text/html')
    res.end("Success " + id + " is " + success)
}
