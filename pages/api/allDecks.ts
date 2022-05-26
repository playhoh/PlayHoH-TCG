export const allPredefinedDecks = ["beta1", "beta2"]

export default async function handler(req, res) {
    res.status(200).json(allPredefinedDecks)
}
