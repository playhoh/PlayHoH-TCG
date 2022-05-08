import React from 'react'
import {useUser} from "../src/client/userApi";
import {LoginFirst} from "./LoginFirst";
import {MenuItemFixed, SelectFixed} from "./MenuItemFixed";

export function DeckSelect() {
    const {user, userPointer, isAuthenticated} = useUser()
    const [deck, setDeck] = React.useState("default")

    React.useEffect(() => {
        if (user?.deck && deck === "default") setDeck(user.deck)
    }, [user?.deck])

    return !isAuthenticated ? <LoginFirst/> : <div>
        <SelectFixed value={deck} onChange={x => {
            const newDeck = x.target.value
            setDeck(newDeck)
            setTimeout(() => {
                userPointer.set('deck', newDeck)
                userPointer.save()
            }, 1)
        }}>
            <MenuItemFixed value={"default"}><i>choose a deck</i></MenuItemFixed>
            <MenuItemFixed value={"beta1"}>Beta1 (Indian chiefs)</MenuItemFixed>
            <MenuItemFixed value={"beta2"}>Beta2 (Electrical engineers)</MenuItemFixed>
        </SelectFixed>
    </div>;
}