import {effectsTypeForCategory, serverEffectsData} from "../pages/api/effects"
import {debug, toSet} from "../src/utils"
import {getRelevantEffectsFor, getRelevantEffectsForObjectCategory} from "../src/effectsApi"

describe("GenCard OLD METHOD", () => {
    it("should buildTexts", async () => {
        let id = 'composer'
        let effects = getRelevantEffectsFor(serverEffectsData)(id)
        console.log(id, "=>", effects)

        expect(toSet(effects.map(x => x.effect)).sort()).toEqual(toSet(["think", "craft"]).sort())
    })

    it("should getRelevantEffectsForObjectCategory", async () => {
        debug("effectsTypeForCategory", effectsTypeForCategory)

        let id = 'Maritime'
        let effects = getRelevantEffectsForObjectCategory(serverEffectsData)(id)
        console.log(id, "=>", effects)

        expect(toSet(effects.map(x => x.effect)).sort()).toEqual(toSet([
            "destroy",
            "shoot",
            "steal",
            "sabotage",
            "command"
        ]).sort())
    })
})
