import {NextApiRequest, NextApiResponse} from "next"

export const allPredefinedDecks = ["beta1", "beta2"]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json(allPredefinedDecks)
}
