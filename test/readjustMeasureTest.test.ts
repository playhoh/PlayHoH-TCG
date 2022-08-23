import {adjustNameAndTypeBasedOnMeasurement} from "../src/cardCreation"
import {regenerateTextBasedOnMeasurement} from "../src/server/dbpedia"
import {testMode} from "../src/testUtils"

const wrapped = obj => ({
    ...obj,
    get: x => obj[x],
    set: (k, v) => obj[k] = v
})

testMode()

describe("MeasureText 2", () => {
    it("regenerateTextBasedOnMeasurement", async () => {
        const text = "some\nlong\ntext\nthat\nspans\n6 lines"
        const obj = {
            name: "Alexander McKenzie (Medal of Honor)",
            displayName: "Alexander McKenzie (Medal of Honor)",
            typeLine: "Person - US Navy Boatswain's Mate, who received the Medal of Honor",
            text
        }

        await adjustNameAndTypeBasedOnMeasurement(wrapped(obj))
        await regenerateTextBasedOnMeasurement(wrapped(obj))

        expect(obj.displayName).toBe("Alexander McKenzie")
        expect(obj.typeLine).toBe("Person - US Navy Boatswain's Mate")
        expect(obj.text).not.toBe(text)
    })

    it("adjustNameAndTypeBasedOnMeasurement 2", async () => {
        const obj = {
            name: "Some id",
            displayName: "George W",
            typeLine: "Person - Governor of Washington Territory"
        }
        await adjustNameAndTypeBasedOnMeasurement(wrapped(obj))
        expect(obj.typeLine).toBe("Person - Governor of Washington Territory")
        expect(obj.displayName).toBe("George W")
    })

    it("adjustNameAndTypeBasedOnMeasurement limit", async () => {
        const text =
            "Main: If your total ⌾ ≥ 3, gain 4 ■.\n"
            + "Main: If your total ⌾ ≥ 3, gain 4 ■.\n"
            + "Main: If your total ⌾ ≥ 3, gain 4 ■.\n"
            + "Main: If your total ⌾ ≥ 3, gain 4 ■."
        let displayName = "George Edgcasdas di"
        let typeLine = "Person - Captain, Earl"
        const obj = {
            name: "George Edgcumbe",
            displayName,
            typeLine,
            text
        }
        await adjustNameAndTypeBasedOnMeasurement(wrapped(obj))
        expect(obj.typeLine).toBe(typeLine)
        expect(obj.displayName).toBe(displayName)
        expect(obj.text).toBe(text)
    })

    it("adjustNameAndTypeBasedOnMeasurement 3", async () => {
        const typeLine = "Person - Captain, EarlCaptasd asd"
        const obj = {
            name: "Some id",
            displayName: "Some name",
            typeLine
        }
        await adjustNameAndTypeBasedOnMeasurement(wrapped(obj))
        expect(obj.typeLine).toBe(typeLine)
    })

    it("adjustNameAndTypeBasedOnMeasurement 4", async () => {
        const obj = {
            name: "Some id",
            displayName: "Some name",
            typeLine: "Person - Entrepreneur and reporter"
        }
        await adjustNameAndTypeBasedOnMeasurement(wrapped(obj))
        expect(obj.typeLine).toBe("Person - Entrepreneur and reporter")
    })

    it("adjustNameAndTypeBasedOnMeasurement 5", async () => {
        const obj = {
            name: "Some id",
            displayName: "Some name",
            typeLine: "Person - Entrepreneur and reporter, who was famous for XY"
        }
        await adjustNameAndTypeBasedOnMeasurement(wrapped(obj))
        expect(obj.typeLine).toBe("Person - Entrepreneur and reporter")
    })
})
