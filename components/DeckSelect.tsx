import React from 'react'
import {useUser} from "../src/client/userApi"
import {MenuItemFixed, SelectFixed} from "./MenuItemFixed"
import {predefinedDecks} from "../src/cardData"

type DeckSelectProps = {
    onChange?: (s: string) => void
}

export function DeckSelect({onChange}: DeckSelectProps) {
    const {user, userPointer, isAuthenticated} = useUser()
    const [deck, setDeck] = React.useState("default")

    React.useEffect(() => {
        if (user?.deck && deck === "default") setDeck(user.deck)
    }, [user?.deck])

    // !isAuthenticated ? <LoginFirst/> : <div>
    return <SelectFixed value={deck} onChange={x => {
        const newDeck = x.target.value
        setDeck(newDeck)
        setTimeout(() => {
            if (isAuthenticated) {
                userPointer.set('deck', newDeck)
                userPointer.save()
            }
            onChange && onChange(newDeck)
        }, 1)
    }}>
        <MenuItemFixed value={"default"}><i>choose a deck</i></MenuItemFixed>
        {predefinedDecks.map(obj =>
            <MenuItemFixed value={obj.id}>{obj.name}</MenuItemFixed>
        )}
    </SelectFixed>
    // </div>
}