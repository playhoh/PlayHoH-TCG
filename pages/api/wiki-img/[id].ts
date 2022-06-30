export default async (req, res) => {
    const id = req.url.substring(req.url.lastIndexOf("/") + 1)
    res.send(id)
}
