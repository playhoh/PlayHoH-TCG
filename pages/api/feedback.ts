import {log} from "../../src/utils"
import {NextApiRequest, NextApiResponse} from "next"
import {postWithUserFromSession} from "./vote"
import {CardFeedbackData} from "../../interfaces/baseTypes"
import {Api} from "../../src/Api"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await postWithUserFromSession(req, async (code, invalid) => {
        res.status(code).json(invalid)
    }, async (user, body: CardFeedbackData) => {
        // debug("user", user)

        let bodyOk =
            typeof body?.name === "string"
            && typeof body?.feedback === "string"
            && typeof body?.field === "string"
            && typeof body?.vote === "number"

        if (!bodyOk) {
            res.status(400).json({
                name: "name must be a non-empty string, got " + body?.name,
                feedback: "feedback must be a non-empty string, got " + body?.feedback,
                field: "field must be a non-empty string, got " + body?.field,
                vote: "vote must be +1, 0, or -1, got " + body?.vote
            })
        } else {
            const query = new Api.Query("CardFeedback")
            query.equalTo("name", body.name)
            query.equalTo("username", user)
            query.limit(1)
            const result = await query.find({useMasterKey: true})
            let feedback = new Api.Object('CardFeedback')

            if (result.length !== 0) {
                feedback = result[0]
            }

            feedback.set("username", user)
            feedback.set("name", body.name)
            feedback.set("vote", body.vote)
            feedback.set("feedback", body.feedback)
            feedback.set("field", body.field)

            try {
                await feedback.save()
                res.status(200).json({success: "feedback for " + body.name})
            } catch (e) {
                log("error on feedback.save", e)
                res.status(400).json({error: "error saving feedback " + e})
            }
        }
    })
}
