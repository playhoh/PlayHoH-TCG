import Moralis from "moralis/node"
import {NextApiRequest, NextApiResponse} from "next"

const Vote = Moralis.Object.extend('Vote')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = decodeURIComponent(req.url.substring(req.url.lastIndexOf("/") + 1))
    const queryUser = new Moralis.Query(Moralis.User)
    queryUser.equalTo("username", id)
    const resUser = await queryUser.find({useMasterKey: true})

    if (resUser.length > 0) {
        const query = new Moralis.Query(Vote)
        query.equalTo("user", resUser[0])
        const votes = await query.find({useMasterKey: true})
        const votesRes = votes.map(x => ({name: x.get('name'), delta: x.get('delta')}))
        res.status(200).json(votesRes)
    } else {
        res.status(200).json([])
    }
}
