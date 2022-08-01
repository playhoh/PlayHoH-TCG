import {getImgRoute} from "../img/[id]"
import {NextApiRequest, NextApiResponse} from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await getImgRoute(req, res)
}

