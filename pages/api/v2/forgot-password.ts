export default async (req, res) => {
    try {
        const {email} = JSON.parse(req.body)

        throw new Error("TODO, send mail to " + email)
        /*
        res
        .status(200)
        .send({todo:true})
        */
    } catch (e) {
        res
            .status(400)
            .send({error: e.toString()})
    }
}
