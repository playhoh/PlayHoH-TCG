import {beta1Json} from "../../src/server/personJson";

export default (req, res) => {
    res.status(200).end(
        JSON.stringify(beta1Json, null, 2)
    )
}
