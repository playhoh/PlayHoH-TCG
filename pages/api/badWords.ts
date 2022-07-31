import {badWordList} from "../../src/server/staticData"

export default (req, res) => {
    res
        .status(200)
        .send(badWordList)
}
