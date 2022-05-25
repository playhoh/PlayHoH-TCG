//"https://i.imgur.com/5wutLhx.png"
export const cardImgUrlForName = (name: string, oldMethod?: boolean) =>
    "/api/svg/" + encodeURIComponent(name) + (!oldMethod ? "?s=1" : "")

export const tutorialHand = () =>
    ["Rain-in-the-Face", "Cochise", "Chief Joseph"]

export const tutorialDeck = () => ["Wahunsonacock", "War Bonnet", "Geronimo",
    "Tomahawk", "Hiawatha", "Makataimeshekiakiak",
    "Fire Ritual", "Wiigwaasabak", "Rite Inscription",
    "Tashunca-Uitco", "Tipi"]

export const tutorialObjective = () =>
    ({text: "End: You get ■ for each 💪 of your people.", logic: "endCountPower"})

export function availableCardNames() {
    return [
        "Albert_Einstein",
        "Albert_Sabin",
        "Alfred_de_Musset",
        "Alice_Hamilton",
        "Anaximander",
        "Anne_Hathaway",
        "Aristophanes",
        "Arthur_Rubinstein",
        "Arthur_Schopenhauer",
        "Artie_Shaw",
        "Art_Tatum",
        "Blaise_Pascal",
        "Bruno_Walter",
        "Calvert_Vaux",
        "Calvin_Klein",
        "Chaim_Weizmann",
        "Charles_Baudelaire",
        "Charles_Darwin",
        "Christopher_Marlowe",
        "Daniel_Morgan",
        "Dennis_Gabor",
        "Dugald_Stewart",
        "Eleonora_Duse",
        "Elihu_Thomson",
        "Elmer_Ambrose_Sperry",
        "Erica_Jong",
        "Ernest_Bevin",
        "Eugene_Ormandy",
        "Ferdinand_de_Lesseps",
        "Frank_Capra",
        "Fritz_Kreisler",
        "Geoffrey_Chaucer",
        "George_Balanchine",
        "George_Burns",
        "George_Gershwin",
        "George_Lucas",
        "George_Mason",
        "George_Washington_Carver",
        "Georg_Meissner",
        "Gertrude_Stein",
        "Giuseppe_Mazzini",
        "Glenn_Curtiss",
        "Henry_Clay_Frick",
        "Herodotus",
        "Horace_Mann",
        "Hosea",
        "Hosni_Mubarak",
        "Howard_Hughes",
        "Igor_Sikorsky",
        "Irving_Berlin",
        "James_Boswell",
        "James_Mill",
        "James_Ussher",
        "Jean-Paul_Sartre",
        "John_Jacob_Astor",
        "John_Locke",
        "Jonathan_Trumbull",
        "Julius_Caesar",
        "Khufu",
        "Leibnitz",
        "Leontyne_Price",
        "Lillian_Hellman",
        "Louisa_May_Alcott",
        "Louis_Sullivan",
        "Macbeth",
        "Mack_Sennett",
        "Manuel_de_Falla",
        "Man_in_hood",
        "Marian_Anderson",
        "Melina_Mercouri",
        "Mikhail_Kalinin",
        "Nikola_Tesla",
        "Oliver_Wendell_Holmes_Jr.",
        "Paul_Heyse",
        "Paul_Robeson",
        "Peter_Mark_Roget",
        "Praxiteles",
        "R._J._Mitchell",
        "Red_Cloud",
        "Richard_D'Oyly_Carte",
        "Richard_Strauss",
        "Robert_Woodrow_Wilson",
        "Rosa_Ponselle",
        "Rube_Goldberg",
        "Saint_Lawrence",
        "Satchel_Paige",
        "Sergei_Eisenstein",
        "Socrates",
        "Spencer_Tracy",
        "T._H._White",
        "Vagn_Walfrid_Ekman",
        "Valentina_Tereshkova",
        "Van_Wyck_Brooks",
        "Washington_Irving"
    ]
}
