import {anglicize, lerp} from "../src/utils"

describe("SimpleText", () => {
    it("should print 1+1", async () => {
        console.log("1+1=" + (1 + 1))
        expect(0).toBe(0)
    })

    it("should lerp two numbers", async () => {
        expect(lerp(1, 2, 0)).toBe(1)
        expect(lerp(1, 2, 0.5)).toBe(1.5)
        expect(lerp(1, 2, 1)).toBe(2)
    })

    it("should anglicize", async () => {
        expect(
            anglicize(
                "Dès Noël où un zéphyr haï me vêt de glaçons würmiens je dîne d'exquis rôtis de bœuf au kir à l'aÿ d'âge mûr & cætera"))
            .toEqual(
                "Des Noel ou un zephyr hai me vet de glacons wurmiens je dine d'exquis rotis de boeuf au kir a l'ay d'age mur & caetera"
            )

        expect(
            anglicize(
                "500px-Polish_Legions_picnic,_Łodz_October_2014_08.jpg"))
            .toEqual(
                "500px-Polish_Legions_picnic,_Lodz_October_2014_08.jpg"
            )


    })
})
