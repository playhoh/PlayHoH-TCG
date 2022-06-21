import {badWordList} from "../../src/server/staticData"

export default (req, res) => {
    res.statusCode = 200
    res.send(badWordList)
}
