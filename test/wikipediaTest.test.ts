import {testMode} from "../src/utils"
import {parseWikiText} from "../src/wikiApi";

/*
import wtf from "wtf_wikipedia"
// TODO typescript package, jest doesnt like it...
let doc = await wtf.fetch('Toronto Raptors')
let doc = wtf(objectWiki())
debug("parsing ok!")
let infobox = doc.infobox()
debug(infobox)
debug(infobox?.get('Ship launched'))
 */

testMode()
describe("WikiTest", () => {
    it("should parse low level parts #1", async () => {
        const res = parseWikiText("name", true,
            `'''XY''' is a german author that popularized drugs.`,
            "category")
        expect(res).toEqual(
            {
                category: "category",
                firstName: "name",
                isPerson: true,
                longTypeLine: "german author that popularized drugs.",
                name: "name",
                typeLine: "German author",
                wikitext: "'''XY''' is a german author that popularized drugs."
            })
    })

    it("should parse low level parts #2", async () => {
        const firstText = `'''''{{Lang|la|Systema Naturae}}''''' (originally in [[Latin language|Latin]] written '''''{{Lang|la|Systema Naturæ}}''''' with the [[Orthographic ligature|ligature]] [[æ]]) is one of the major works of the [[Sweden|Swedish]] botanist, zoologist and physician [[Carl Linnaeus]] (1707–1778) and introduced the [[Linnaean taxonomy]].`
        const infobox = "{{short description|Major work by Swedish botanist Carolus Linnaeus}}\n\n{{Infobox book\n| name             = ''Systema Naturæ''\n| image            = File:Linnaeus1758-title-page.jpg\n| caption          = Title page of the 1758 edition of Linnaeus's ''Systema Naturæ''.<ref name=Linn1758>{{cite book |last=Linnaeus |first=Carl |title=Systema naturae per regna tria naturae :secundum classes, ordines, genera, species, cum characteribus, differentiis, synonymis, locis |publisher=Laurentius Salvius |location=Stockholm |year=1758 |url=https://www.biodiversitylibrary.org/bibliography/542 |language=la |edition=[[10th edition of Systema Naturae|10th]]}}</ref> \n| author           = [[Carl Linnaeus]]<br />(Carl von Linné)\n| illustrator      =\n| country          = Sweden\n| subject          = [[Taxonomy (biology)|Taxonomy]]\n| genre            = Biological classification\n| publisher        = \n| pub_date         = {{Start date|1735}}\n| pages            = \n| awards           = \n| congress         =  QH43 .S21\n| wikisource       =\n}}\n\n"
        const wikitext = infobox + firstText
        const res = parseWikiText("Systema Naturae", false, wikitext, "category")
        expect(res).toEqual({
            category: "category",
            isPerson: false,
            name: "Systema Naturae",
            typeLine: "Book",
            wikitext,
            year: "1735"
        })
    })

    it("should parse low level parts #3", async () => {
        const name = "Cassius Felix"
        const longTypeLine = "[[Roman Empire|Roman]] [[Diocese of Africa|African]] [[Medicine in ancient Rome|medical writer]] probably native of [[Constantine, Algeria|Constantina]]. He is known for having written in AD 447 a [[Latin language|Latin]] treatise titled ''De Medicina''.<ref name=\"Nutton2012\">{{cite book|last=Nutton|first=Vivian|title=Ancient medicine|url=https://books.google.com/books?id=uWGr2Be9NjMC|accessdate=3 April 2013|year=2012|publisher=Routledge|isbn=9780415520942}}</ref> The little we can say of the author comes from his book, that is meant to be a simple handbook for practical use in which he wants others to be able to take advantage of his experience as a physician. His work appears to draw heavily, both directly and indirectly, on Greek medical sources, as was common in the African school of medicine.<ref name=\"Langslow2000\">{{cite book|last=Langslow|first=D. R.|title=Medical Latin in the Roman Empire|url=https://books.google.com/books?id=8AjERgUJAEoC|accessdate=3 April 2013|year=2000|publisher=Oxford University Press, Incorporated|isbn=9780198152798}}</ref>"
        const wikitext =
            "'''Cassius Felix''' ({{IPAc-en|ˈ|k|æ|ʃ|ə|s|_|ˈ|f|iː|l|ɪ|k|s}}), also '''Cassius Felix of Cirta''', was a "
            + longTypeLine
            + "\n\nA Christian by faith, he may be the person mentioned in passing in the anonymous ''[[De miraculis Sancti Stephani]]'', a work written between 418 and 427, where a certain Felix is referred as holding the high medical dignity of [[archiater]], or chief doctor of his community.<ref name=\"Langslow2000\" />\n\nThe ''[[editio princeps]]'' of his work was first published in 1879 in a [[Teubner]] edition edited by [[Valentin Rose (classicist)|Valentin Rose]].<ref name=\"Langslow2000\" />\n\nThe name Cassius Felix is sometimes also applied<ref>[[William Smith (lexicographer)|William Smith]], ''[[Dictionary of Greek and Roman Biography and Mythology]]'', p. [http://www.ancientlibrary.com/smith-bio/0635.html 626] {{Webarchive|url=https://web.archive.org/web/20121012133114/http://www.ancientlibrary.com/smith-bio/0635.html |date=2012-10-12 }}</ref> to '''Cassius Iatrosophista''', an earlier Greek medical writer (2nd or 3rd century AD) known only as the author of 84 or 85 ''Quaestiones Medicae et Problemata Naturalia'' ({{lang-grc|Ἰατρικαὶ Ἀπορίαι καὶ Προβλήματα Φυσικά}}).<ref>A. Garzya and R. Masullo, ''I problemi di Cassio Iatrosophista'', Naples: Accademia Pontaniana, 2004</ref>\n\n==References==\n{{reflist}}\n\n==External links==\n* [https://archive.org/stream/cassiifelicisde01rosegoog#page/n4/mode/2up Cassius Felix, ed. Rose 1879]\n* [https://archive.org/stream/physicietmedicig01ideluoft#page/n153/mode/2up Cassius Iatrosophista, ed. Ideler 1841]\n\n{{Authority control}}\n[[Category:5th-century Roman physicians]]\n[[Category:5th-century Latin writers]]\n[[Category:Cassii|Felix]]"
        const res = parseWikiText(name, true, wikitext, "category")
        expect(res).toEqual({
            category: "category",
            firstName: "Cassius",
            isPerson: true,
            name,
            typeLine: "Roman African medical writer",
            longTypeLine,
            wikitext,
            year: "5th-century"
        })
    })
})
