import {getImgRoute} from "../img/[id]"

// legacy route /svg/XY
export default async function handler(req, res) {
    await getImgRoute(req, res)
}

