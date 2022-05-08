import Link from 'next/link'
import Layout from "../components/Layout";
import React from "react";
import {JoinDiscord} from "../components/JoinDiscord";

const beta =
    <div style={{float: "right"}}>
        <Link href="./start">Try the beta!</Link>
    </div>

export default function IndexPage() {
    return (
        <Layout title="Heroes of History TCG">
            <div className="fade-in-image">
                <div className="wrapper">
                    {beta}
                    <div className="main">
                        <div className="inner icons">
                            <h1 id="text01">Heroes of History</h1>

                            <p className="textPara">is an upcoming Trading Card Game from players for the players</p>

                            <p className="textPara">
                                <div className="images">
                                    <div className="flip-card">
                                        <div className="flip-card-inner">
                                            <div className="flip-card-front">
                                                <img src="https://i.imgur.com/RvhQJIo.png" alt="Card 2"/>
                                            </div>
                                            <div className="flip-card-back">
                                                <img src="https://i.imgur.com/5wutLhx.png" alt="Card 1"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </p>

                            <hr className="divider01"/>

                            <ul className="icons01">
                                <li>
                                    <a className="tooltip n03" href="https://discord.gg/gyjZ9Fbkbm">
                                        <svg>
                                            <g id="discord" viewBox="0 0 40 40">
                                                <path
                                                    d="M33.2,8.3c-2.5-1.1-5.1-1.9-7.9-2.4c-0.3,0.6-0.7,1.4-1,2c-2.9-0.4-5.8-0.4-8.7,0c-0.3-0.6-0.7-1.4-1-2 c-2.8,0.5-5.4,1.3-7.9,2.4c-5,7.2-6.3,14.2-5.6,21.1c3.3,2.3,6.5,3.8,9.6,4.7c0.8-1,1.5-2.1,2.1-3.3c-1.1-0.4-2.2-0.9-3.2-1.5 c0.3-0.2,0.5-0.4,0.8-0.6c6.3,2.8,13,2.8,19.2,0c0.3,0.2,0.5,0.4,0.8,0.6c-1,0.6-2.1,1.1-3.2,1.5c0.6,1.1,1.3,2.2,2.1,3.3 c3.1-0.9,6.3-2.4,9.6-4.7C39.7,21.4,37.5,14.4,33.2,8.3z M13.7,25.1c-1.9,0-3.4-1.7-3.4-3.7s1.5-3.7,3.4-3.7c1.9,0,3.5,1.7,3.4,3.7 C17.1,23.4,15.6,25.1,13.7,25.1z M26.3,25.1c-1.9,0-3.4-1.7-3.4-3.7s1.5-3.7,3.4-3.7c1.9,0,3.5,1.7,3.4,3.7 C29.7,23.4,28.2,25.1,26.3,25.1z"/>
                                            </g>
                                        </svg>
                                        <span className="label tooltiptext">Discord</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="tooltip n02" href="https://twitter.com/byKarstenWinter">
                                        <svg>
                                            <g id="twitter" viewBox="0 0 40 40">
                                                <path
                                                    d="M36.3,10.2c-1,1.3-2.1,2.5-3.4,3.5c0,0.2,0,0.4,0,1c0,1.7-0.2,3.6-0.9,5.3c-0.6,1.7-1.2,3.5-2.4,5.1 c-1.1,1.5-2.3,3.1-3.7,4.3c-1.4,1.2-3.3,2.3-5.3,3c-2.1,0.8-4.2,1.2-6.6,1.2c-3.6,0-7-1-10.2-3c0.4,0,1.1,0.1,1.5,0.1 c3.1,0,5.9-1,8.2-2.9c-1.4,0-2.7-0.4-3.8-1.3c-1.2-1-1.9-2-2.2-3.3c0.4,0.1,1,0.1,1.2,0.1c0.6,0,1.2-0.1,1.7-0.2 c-1.4-0.3-2.7-1.1-3.7-2.3s-1.4-2.6-1.4-4.2v-0.1c1,0.6,2,0.9,3,0.9c-1-0.6-1.5-1.3-2.2-2.4c-0.6-1-0.9-2.1-0.9-3.3s0.3-2.3,1-3.4 c1.5,2.1,3.6,3.6,6,4.9s4.9,2,7.6,2.1c-0.1-0.6-0.1-1.1-0.1-1.4c0-1.8,0.8-3.5,2-4.7c1.2-1.2,2.9-2,4.7-2c2,0,3.6,0.8,4.8,2.1 c1.4-0.3,2.9-0.9,4.2-1.5c-0.4,1.5-1.4,2.7-2.9,3.6C33.8,11.2,35.1,10.9,36.3,10.2L36.3,10.2z"/>
                                            </g>
                                        </svg>
                                        <span className="label tooltiptext">Twitter</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="tooltip n06"
                                       href="mailto:brox.p@web.de?body=Hi%20Karsten%0AI%20just%20saw%20your%20project%20Heroes%20of%20History.%0A%0A&subject=Hi%20Karsten">
                                        <svg>
                                            <g id="mail" viewBox="0 0 40 40">
                                                <path
                                                    d="M37.3,15.3v15.3c0,0.8-0.3,1.6-0.9,2.2c-0.6,0.6-1.4,0.9-2.2,0.9H5.8c-0.8,0-1.6-0.3-2.2-0.9s-0.9-1.4-0.9-2.2V15.3 c0.5,0.6,1.2,1.1,2,1.7c4.7,3.1,7.9,5.4,9.6,6.7c0.7,0.5,1.4,0.9,1.8,1.2c0.4,0.3,1,0.6,1.9,0.9c0.7,0.3,1.5,0.5,2.1,0.5l0,0 c0.6,0,1.4-0.2,2.1-0.5c0.7-0.3,1.4-0.6,1.9-0.9c0.4-0.3,1-0.7,1.8-1.2c2.2-1.6,5.4-3.8,9.6-6.7C36.1,16.5,36.7,15.9,37.3,15.3 L37.3,15.3z M37.3,9.6c0,1-0.3,2-0.9,2.9c-0.6,0.9-1.5,1.8-2.4,2.4c-4.9,3.3-7.9,5.4-9,6.2c-0.1,0.1-0.4,0.3-0.8,0.6 c-0.4,0.3-0.7,0.5-1,0.7c-0.3,0.2-0.6,0.4-1,0.6c-0.4,0.2-0.7,0.4-1.1,0.5c-0.4,0.1-0.6,0.2-0.9,0.2l0,0c-0.3,0-0.6-0.1-0.9-0.2 c-0.3-0.1-0.7-0.3-1.1-0.5c-0.4-0.2-0.7-0.4-1-0.6c-0.3-0.2-0.6-0.4-1-0.7c-0.4-0.3-0.7-0.5-0.8-0.6c-1.1-0.8-2.8-2-5.1-3.5 c-2.3-1.6-3.3-2.4-3.7-2.7c-0.8-0.5-1.6-1.2-2.3-2.2s-1-1.9-1-2.6c0-1,0.3-1.9,0.8-2.5c0.5-0.6,1.2-1,2.3-1h28.4 c0.8,0,1.6,0.3,2.2,0.9C37.1,8.1,37.3,8.8,37.3,9.6L37.3,9.6z"/>
                                            </g>
                                        </svg>
                                        <span className="label tooltiptext">Email</span>
                                    </a>
                                </li>
                            </ul>

                            <p className="textPara">
                                <strong>
                                </strong>
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
                            <p className="textPara">
                                <strong>Evolutionary:</strong>
                            </p>

                            <p className="textPara skill">
                                Machine learning will use publicly available information to generate playable cards of
                                historic personas and artifacts.<br/>

                                Natural language processing will create and segment flavorful classNamees such as
                                &quot;Villain&quot;,
                                &quot;Priest&quot;, &quot;Warrior&quot; or &quot;Leader&quot; and an open-source
                                predefined card game engine will
                                create their stats such as power, toughness and abilities based on their wikipedia page.<br/>

                                Creative common images will be used to create the card images.

                            </p>
                            <p className="textPara">
                                <strong>Autonomous:</strong>
                            </p>

                            <p className="textPara skill">
                                Once every quarter the machine learning algorithm will spill out 250 new tokenized cards
                                which the players can obtain by playing or buying on the open marketplace.
                                <br/>
                                To make sure the game (and their cards) stay balanced, every player can vote on too
                                powerful or bad cards to improve them in the first week of the season.

                            </p>
                            <p className="textPara">
                                <strong>Epoches:</strong>
                            </p>

                            <p className="textPara skill">
                                The game is called Heroes of History, because you play an Epoche from the past.
                                <br/>
                                For example the French Revolution featuring Louis XVI. King of France, Marie Antoinette,
                                Queen of France and Artifacts such as the Guillotine as Weapons in the game.

                            </p>
                            <p className="textPara">
                                <strong>Why:</strong>
                            </p>

                            <p className="textPara skill">
                                The whole idea is to give players ownership over their items. Ethereum was born because
                                Vitalik wasn&apos;t comfortable with how World of Warcraft treated his online assets.
                                <br/>
                                The reason it&apos;s autonomous and evolutionary is that there is no single entity
                                controlling the rules of a game. Esports can never be olympic, if there is a centralized
                                profitable company behind it, making the rules.

                            </p>

                            <p className="textPara">
                                <strong>About us:</strong>
                            </p>
                            <p className="textPara">
                                Designed and implemented by long-time TCG and board game players and developers,
                                delivering you an open source game with a democratic view on its card pool and a modular
                                rule system.
                            </p>

                            <p className="textPara">
                                <strong>Putting it all together:</strong>
                            </p>
                            <p className="textPara">
                                Heroes of History is the first decentralized, evolutionary and self-creating game,
                                representing the history of humans.
                                <br/>

                                The frontends will be open-sourced on Github and will run on all devices.
                                <br/>

                                HoH Cards are tokenized and tradable on chain.
                            </p>

                            <hr className="divider01"/>
                            <p className="textPara">
                                Join our Discord server to discuss the project and contribute.
                            </p>
                            <JoinDiscord/>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
