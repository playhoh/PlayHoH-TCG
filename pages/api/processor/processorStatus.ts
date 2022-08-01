import {processorStatusForId} from "./processor"

export default async function handler(req, res) {
    res.status(200).send(processorStatusForId)
}
