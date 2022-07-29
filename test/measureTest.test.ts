import {measureText, splitIntoBox} from "../src/measureText"
import {cardBoxFontSize} from "../src/utils"

describe("MeasureText", () => {
    it("should measure texts", async () => {
        expect(measureText("")).toBe(0)
        expect(measureText("ASD")).toBe(24.637500000000003)
        expect(measureText("asd asd")).toBe(41.98125)
    })

    it("should split texts",
        async () => {
            let res = splitIntoBox("Enter: draw a card.", cardBoxFontSize, 100)
            console.log("splitIntoBox", res)
            expect(res.map(x => x.text)).toEqual([
                "Enter: draw a",
                "card."
            ])
        })

    it("should split texts", async () => {
        let res = splitIntoBox("Enter: draw a card.")
        console.log("splitIntoBox", res)
        expect(res.map(x => x.text)).toEqual([
            "Enter: draw a card."
        ])
    })

    it("should split texts", async () => {
        let res = splitIntoBox("Enter: Draw a card.\nLeave: Put a card from your hand onto your deck.")
        console.log("splitIntoBox", res)
        expect(res.map(x => x.text)).toEqual([
            "Enter: Draw a card.",
            "Leave: Put a card from your",
            "hand onto your deck.",
        ])
    })

    it("should split texts", async () => {
        let res = splitIntoBox("Enter: Draw a card.\nMain: You may sacrifice a resource to draw 2 cards.")
        console.log("splitIntoBox", res)
        expect(res.map(x => x.text)).toEqual([
            "Enter: Draw a card.",
            "Main: You may sacrifice a",
            "resource to draw 2 cards.",
        ])
    })

    it("should split texts", async () => {
        expect(splitIntoBox(
            "Enter: Pay [R] to reduce a person's [W] to 0 until your next turn.\nLeave: Gain 3 [_]."
        ).map(x => x.text)).toEqual([
            "Enter: Pay [R] to reduce a",
            "person's [W] to 0 until your next",
            "turn.",
            "Leave: Gain 3 [_]."
        ])
    })
})


