import {NextApiRequest, NextApiResponse} from "next"
import {Api} from "../../../src/Api"
import {moralisSetup} from "../../../src/baseApi"

const Vote = Api.Object.extend('Vote')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))
    moralisSetup(true)
    const query = new Api.Query(Vote)
    query.equalTo("username", id)
    const votes = await query.find({useMasterKey: true})
    const votesRes = votes.map(x => ({name: x.get('name'), delta: x.get('delta')}))
    res.status(200).json(votesRes)
}
