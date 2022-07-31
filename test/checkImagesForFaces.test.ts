import {testMode} from "../src/testUtils"

async function getFaces(imageToCheck) {
    const pref = "https://web.archive.org/web/20220729071109if_/"
    const comApiFaces = "https://face-recognition-server-nodejs.herokuapp.com/api/faces"

    console.log("checking image\n", imageToCheck, "\n with face api js server\n", comApiFaces)

    const res = await fetch(comApiFaces, {
        method: "POST",
        body: JSON.stringify({url: pref + imageToCheck})
    }).then(x => x.json())

    console.log("faces", res)
    return res
}

describe("face detection", () => {
    it("should work",
        async () => {
            testMode()
            const imageToCheck = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/"
                + "Adam_Smith_The_Muir_portrait.jpg/330px-Adam_Smith_The_Muir_portrait.jpg"

            const res = await getFaces(imageToCheck)
            expect(res?.faces?.length).toEqual(1)
        })
})
