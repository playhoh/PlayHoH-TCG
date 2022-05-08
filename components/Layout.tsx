import Head from 'next/head'
import React from 'react'
import {DarkMode, LightMode} from '@mui/icons-material'
import {Button, createTheme, CssBaseline, ThemeProvider} from "@mui/material"

const themeLight = createTheme({
    palette: {
        background: {
            default: "#fff"
        },
        info: {
            main: '#ddd',
            contrastText: '#000',
        },
    }
})

const themeDark = createTheme({
    palette: {
        background: {
            default: "#000"
        },
        text: {
            primary: "#fff",
            secondary: "#999",
            disabled: '#000'
        },
        info: {
            main: '#ddd',
            contrastText: '#000',
        }
    }
})

export default function Layout(props) {
    const {noCss, title, gameCss, children, mui, noModeToggle} = props

    const [light, setLight] = React.useState(false)

    return (
        <main lang="en">
            <Head>
                {/* Hotjar Tracking Code for https://playhoh.com */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                (function(h,o,t,j,a,r){
                    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                    h._hjSettings={hjid:2917281,hjsv:6};
                    a=o.getElementsByTagName('head')[0];
                    r=o.createElement('script');r.async=1;
                    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                    a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
                `
                }}/>

                <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8"/>
                <meta charSet="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <meta name="title" content={title || "Heroes of History TCG"}/>
                <meta name="description"
                      content="An autonomous, evolutionary trading card game that uses a neural network to generate playable cards of historic personas and artifacts."/>
                <title>{title || "Heroes of History TCG"}</title>
                <meta property="og:type" content="website"/>
                <meta property="og:url" content="https://playhoh.com/"/>
                <meta property="og:title" content={title || "Heroes of History TCG"}/>
                <meta property="og:description"
                      content="An autonomous, evolutionary trading card game that uses a neural network to generate playable cards of historic personas and artifacts."/>
                <meta property="og:image"
                      content="og-image.png"/>

                <meta property="twitter:card" content="summary_large_image"/>
                <meta property="twitter:url" content="https://playhoh.com/"/>
                <meta property="twitter:title" content={title || "Heroes of History TCG"}/>
                <meta property="twitter:description"
                      content="An autonomous, evolutionary trading card game that uses a neural network to generate playable cards of historic personas and artifacts."/>
                <meta property="twitter:image"
                      content="https://playhoh.com/og-image.png"/>

                <meta property="og:title"
                      content={title || "Heroes of History TCG"}/>
                <meta property="og:type" content="website"/>
                <meta property="og:url"
                      content="https://playhoh.com"/>
                <meta property="og:description"
                      content="An autonomous evolutionary trading card game"/>
                <meta property="og:image"
                      content="https://playhoh.com/og-image.png"/>

                <link rel="apple-touch-icon" sizes="180x180"
                      href="../apple-touch-icon.png"/>
                <link rel="icon" type="image/png" sizes="32x32"
                      href="../favicon-32x32.png"/>
                <link rel="icon" type="image/png"
                      sizes="16x16"
                      href="../favicon-16x16.png"/>
                <link rel="manifest"
                      href="/manifest.json"/>
                <link rel="mask-icon"
                      href="../public/safari-pinned-tab.svg"
                      color="#5bbad5"/>
                {noCss ? "" :
                    <link rel="stylesheet" href="./style.css"/>
                }
                {!gameCss ? "" :
                    <link rel="stylesheet" href="./game.css"/>
                }

                <meta
                    name="msapplication-TileColor"
                    content="#ffffff"/>
                <meta name="theme-color"
                      content="#ffffff"/>
            </Head>

            {mui ?
                <ThemeProvider theme={light ? themeLight : themeDark}>
                    <CssBaseline/>
                    {noModeToggle ? ""
                        : <Button style={{float: 'right'}} onClick={() => setLight(prev => !prev)}>{
                            light ? <LightMode/> : <DarkMode/>
                        }</Button>}
                    {children}
                </ThemeProvider>
                : children
            }
        </main>
    )
}
