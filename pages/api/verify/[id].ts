export default async function handler(req, res) {
    const id = req.url.substring(req.url.lastIndexOf("/") + 1)
    const success = true
    res.status(200)
    res.setHeader('Content-Type', 'text/html')
    res.end("Success " + id + " is " + success)
}
