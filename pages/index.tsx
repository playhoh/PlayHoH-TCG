import {Layout} from "../components/Layout"
import React from "react"
import {JoinDiscord} from "../components/JoinDiscord"
import {baseGameName, baseGameNameShort} from "../components/constants"
import {DiscordSvg, MailSvg, TwitterSvg} from "../components/SvgIcons"

const beta =
    <div style={{fontSize: "150%", marginTop: 2}}>
        <a href="/start">Try the beta: start playing HoH 🎉</a>
    </div>



export default function IndexPage() {
    return (
        <Layout>
            <div className="fade-in-image">
                <div className="wrapper">
                    {beta}
                    <div className="main">
                        <div className="inner icons">
                            <h1 id="text01">{baseGameName}</h1>

                            <p className="textHeading2">
                                is an upcoming Trading Card Game from players for the players
                            </p>

                            <p className="textHeading">
                                <div className="images">
                                    <div className="flip-card">
                                        <div className="flip-card-inner">
                                            <div className="flip-card-front">
                                                <img src="/staticCardFront.png" alt="Sample HoH Card"/>
                                            </div>
                                            <div className="flip-card-back">
                                                <img src="/staticCardBack.png" alt="Card Back"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </p>

                            <hr className="divider01"/>

                            <ul className="icons01">
                                <li>
                                    <a className="tooltip n03" href="https://discord.gg/gyjZ9Fbkbm">
                                        <DiscordSvg/>
                                        <span className="label tooltiptext">Discord</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="tooltip n02" href="https://twitter.com/byKarstenWinter">
                                        <TwitterSvg/>
                                        <span className="label tooltiptext">Twitter</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="tooltip n06"
                                       href={
                                           "mailto:brox.p@web.de?body=Hi%20Karsten%0AI%20just%20saw%20your%20project%20"
                                           + encodeURIComponent(baseGameNameShort)
                                           + ".%0A%0A&subject=Hi%20Karsten"
                                       }>
                                        <MailSvg/>
                                        <span className="label tooltiptext">Email</span>
                                    </a>
                                </li>
                            </ul>

                            <p className="textPara">
                            </p>

                            <p className="textPara below">
                                You&apos;re about to experience an autonomous, evolutionary trading card game, inspired
                                by
                                Magic the Gathering and Hearthstone.
                                Be part of a <strong>democratic card adjustment system</strong> to have a healthy
                                competitive environment that is not controlled by a single centralised company.
                                <br/>
                                <br/>
                                This not yet another fantasy card game, there are plenty out there, instead we have
                                the <strong>full real-world historic person cast</strong>, from Aristotle to Nikola
                                Tesla and beyond.
                            </p>
                            <p className="textHeading">
                                Evolutionary:
                            </p>

                            <p className="textPara skill">
                                Machine learning will use publicly available information to generate playable cards of
                                historic personas and artifacts.<br/>

                                Natural language processing will create and segment flavorful classes such as
                                &quot;Scientist&quot;,
                                &quot;Priest&quot;, &quot;Warrior&quot; or &quot;Leader&quot; and an open-source
                                predefined card game engine will
                                create their stats such as power, toughness and abilities based on their wikipedia page.<br/>

                                Creative common images will be used to create the card images.

                            </p>
                            <p className="textHeading">
                                Autonomous:
                            </p>

                            <p className="textPara skill">
                                Once every quarter the machine learning algorithm will spill out 250 new tokenized cards
                                which the players can obtain by playing or buying on the open marketplace.
                                <br/>
                                To make sure the game (and their cards) stay balanced, every player can vote on too
                                powerful or bad cards to improve them in the first week of the season.

                            </p>
                            <p className="textHeading">
                                Epoches:
                            </p>

                            <p className="textPara skill">
                                The game is called {baseGameName}, because you play an Epoche from the past.
                                <br/>
                                For example the French Revolution featuring Louis XVI. King of France, Marie Antoinette,
                                Queen of France and Artifacts such as the Guillotine as Weapons in the game.

                            </p>
                            <p className="textHeading">
                                Why:
                            </p>

                            <p className="textPara skill">
                                The whole idea is to give players ownership over their items. Ethereum was born because
                                Vitalik wasn&apos;t comfortable with how World of Warcraft treated his online assets.
                                <br/>
                                The reason it&apos;s autonomous and evolutionary is that there is no single entity
                                controlling the rules of a game. Esports can never be olympic, if there is a centralized
                                profitable company behind it, making the rules.

                            </p>

                            <p className="textHeading">
                                About us:
                            </p>
                            <p className="textPara">
                                Designed and implemented by long-time TCG and board game players and developers,
                                delivering you an open source game with a democratic view on its card pool and a modular
                                rule system.
                            </p>

                            <p className="textHeading">
                                Putting it all together:
                            </p>
                            <p className="textPara">
                                {baseGameName} is the first decentralized, evolutionary and self-creating game,
                                representing the history of humans.
                                <br/>

                                The frontends will be open-sourced on Github and will run on all devices.
                                <br/>

                                HoH Cards are tokenized and tradeable on chain.
                            </p>

                            <hr className="divider01"/>
                            <p className="textPara">
                                Join our Discord server to discuss the project and contribute.
                            </p>
                            <JoinDiscord/>
                            {/*<div className="textPara textParaCenter">
                                - or -
                            </div>*/}
                            {beta}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
