import {measureText, splitIntoBox} from "../pages/api/measureText"
import {cardBoxWidth} from "../src/utils"

describe("MeasureText", () => {
    it("should measure texts", async () => {
        expect(measureText("")).toBe(0)
        expect(measureText("ASD")).toBe(24.637500000000003)
        expect(measureText("asd asd")).toBe(41.98125)
    })

    it("should split texts", async () => {
        let res = splitIntoBox("Enter: draw a card.", 12, 100)
        console.log("splitIntoBox", res)
        expect(res.map(x => x.text)).toEqual([
            "Enter: draw a",
            "card."
        ])
    })

    it("should split texts", async () => {
        let res = splitIntoBox("Enter: draw a card.", 12, 200)
        console.log("splitIntoBox", res)
        expect(res.map(x => x.text)).toEqual([
            "Enter: draw a card."
        ])
    })

    it("should split texts", async () => {
        let res = splitIntoBox("Enter: draw a card.", 12, 180)
        console.log("splitIntoBox", res)
        expect(res.map(x => x.text)).toEqual([
            "Enter: draw a card."
        ])
    })

    it("should split texts", async () => {
        let res = splitIntoBox("Enter: Draw a card.\nLeave: Put a card from your hand onto your deck.", 12, cardBoxWidth)
        console.log("splitIntoBox", res)
        expect(res.map(x => x.text)).toEqual([
            "Enter: Draw a card.",
            "Leave: Put a card from your",
            "hand onto your deck.",
        ])
    })

    it("should split texts", async () => {
        let res = splitIntoBox("Enter: Draw a card.\nMain: You may sacrifice a resource to draw 2 cards.", 12, cardBoxWidth)
        console.log("splitIntoBox", res)
        expect(res.map(x => x.text)).toEqual([
            "Enter: Draw a card.",
            "Main: You may sacrifice a",
            "resource to draw 2 cards.",
        ])
    })

})


