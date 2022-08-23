import {measureText, splitIntoBox} from "../src/measureText"
import {cardNameBoxWidthMinusCostSVG, cardNameFontSizeSVG, cardTextBoxWidthSVG, cardTextFontSizeSVG} from "../src/utils"

describe("MeasureText", () => {
    it("should measure texts", async () => {
        expect(measureText("", 12)).toBe(0)
        expect(measureText("ASD", 12)).toBe(24.637500000000003)
        expect(measureText("asd asd", 12)).toBe(41.98125)
    })

    it("should split texts - text 1", async () => {
        let res = splitIntoBox(
            "Leave: Put a card from your hand onto your deck.",
            cardTextFontSizeSVG, cardTextBoxWidthSVG
        )
        console.log("splitIntoBox", res)
        expect(res.map(x => x.text)).toEqual([
            "Leave: Put a card from your hand",
            "onto your deck."
        ])
    })

    it("should split texts - text 2",
        async () => {
            let res = splitIntoBox("Enter: draw a card, then discard two cards.", cardTextFontSizeSVG, cardTextBoxWidthSVG)
            console.log("splitIntoBox", res)
            expect(res.map(x => x.text)).toEqual([
                "Enter: draw a card, then discard",
                "two cards."
            ])
        })

    it("should split texts - text 3", async () => {
        let res = splitIntoBox("Enter: draw a card.", cardTextFontSizeSVG, cardTextBoxWidthSVG)
        console.log("splitIntoBox", res)
        expect(res.map(x => x.text)).toEqual([
            "Enter: draw a card."
        ])
    })

    it("should split texts - text 4", async () => {
        let res = splitIntoBox(
            "Enter: Draw a card.\nLeave: Put a card from your hand onto your deck.",
            cardTextFontSizeSVG, cardTextBoxWidthSVG
        )
        console.log("splitIntoBox", res)
        expect(res.map(x => x.text)).toEqual([
            "Enter: Draw a card.",
            "Leave: Put a card from your hand",
            "onto your deck."
        ])
    })

    it("should split texts - text 5", async () => {
        let res = splitIntoBox(
            "Enter: Draw a card.\nMain: You may sacrifice a resource to draw 2 cards.",
            cardTextFontSizeSVG, cardTextBoxWidthSVG
        )
        console.log("splitIntoBox", res)
        expect(res.map(x => x.text)).toEqual([
            "Enter: Draw a card.",
            "Main: You may sacrifice a",
            "resource to draw 2 cards.",
        ])
    })

    it("should split texts - text 6", async () => {
        expect(splitIntoBox(
            "Enter: Pay [R] to reduce a person's [W] to 0 until your next turn.\nLeave: Gain 3 [_].",
            cardTextFontSizeSVG, cardTextBoxWidthSVG
        ).map(x => x.text)).toEqual([
            "Enter: Pay [R] to reduce a",
            "person's [W] to 0 until your next",
            "turn.",
            "Leave: Gain 3 [_]."
        ])
    })

    it("should split texts - name 1", async () => {
        expect(splitIntoBox(
            "Alexander McKenzie (Medal of Honor)",
            cardNameFontSizeSVG, cardNameBoxWidthMinusCostSVG).map(x => x.text)).toEqual([
            "Alexander McKenzie",
            "(Medal of Honor)"
        ])
    })

    it("should split texts - name 2", async () => {
        expect(splitIntoBox(
            "Alexander McKenzie",
            cardNameFontSizeSVG, cardNameBoxWidthMinusCostSVG).map(x => x.text)).toEqual([
            "Alexander McKenzie"
        ])
    })
})


