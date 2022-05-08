import {getCardForId, serverEffectsData} from "../src/server/cardLookup";
import {effectsTypeForCategory} from "../pages/api/effects";
import {debug, toSet} from "../src/utils";
import {getRelevantEffectsFor, getRelevantEffectsForObjectCategory} from "../src/effectsApi";

describe("GenCard", () => {
    it("should look names up", async () => {
        let id = 'Richard Strauss';
        let cardForId = await getCardForId(id)
        console.log(id, "=>", cardForId)

        expect(cardForId.typeLine).toBe("Person - Composer")
        expect(cardForId.flavor).toBe("1864-1949")
    })

    it("should buildTexts", async () => {
        let id = 'composer';
        let effects = getRelevantEffectsFor(serverEffectsData)(id)
        console.log(id, "=>", effects)

        expect(toSet(effects.map(x => x.effect))).toEqual(toSet(["think", "craft"]))
    })

    it("should getRelevantEffectsForObjectCategory", async () => {
        debug("effectsTypeForCategory", effectsTypeForCategory)

        let id = 'Maritime';
        let effects = getRelevantEffectsForObjectCategory(serverEffectsData)(id)
        console.log(id, "=>", effects)

        expect(toSet(effects.map(x => x.effect))).toEqual(toSet([
            "destroy",
            "fight",
            "shoot",
            "steal",
            "sabotage",
            "command"
        ]))
    })
})
