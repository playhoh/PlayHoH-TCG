import Head from 'next/head'
import React, {ReactNode} from 'react'
import {DarkMode, LightMode} from '@mui/icons-material'
import {Button, createTheme, CssBaseline, ThemeProvider} from "@mui/material"
import {baseGameName, baseUrl, deployUrl} from "./constants"
import {withStyles} from "@mui/styles"

const action = {
    disabledBackground: '#111',
    disabled: '#666'
}

const themeLight = createTheme({
    palette: {
        action,
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
        action,
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

type LayoutProps = {
    noCss?: boolean,
    title?: string,
    gameCss?: boolean,
    children: ReactNode,
    mui?: boolean,
    modeToggle?: boolean
}

function Layout0({noCss, title, gameCss, children, mui, modeToggle}: LayoutProps) {
    const [light, setLight] = React.useState(false)

    let titleOrDefault = title || baseGameName

    return (
        <main lang="en" style={{backgroundColor: "black"}}>
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
                {/* end */}

                <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8"/>
                <meta charSet="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <meta name="title" content={titleOrDefault}/>
                <meta name="description"
                      content="An autonomous, evolutionary trading card game that uses a neural network to generate playable cards of historic personas and artifacts."/>
                <title>{titleOrDefault}</title>
                <meta property="og:type" content="website"/>
                <meta property="og:url" content={baseUrl}/>
                <meta property="og:title" content={titleOrDefault}/>
                <meta property="og:description"
                      content="An autonomous, evolutionary trading card game that uses a neural network to generate playable cards of historic personas and artifacts."/>
                <meta property="og:image"
                      content="og-image.png"/>

                <meta property="twitter:card" content="summary_large_image"/>
                <meta property="twitter:url" content={baseUrl}/>
                <meta property="twitter:title" content={titleOrDefault}/>
                <meta property="twitter:description"
                      content="An autonomous, evolutionary trading card game that uses a neural network to generate playable cards of historic personas and artifacts."/>
                <meta property="twitter:image" content={deployUrl("og-image.png")}/>

                <meta property="og:title" content={titleOrDefault}/>
                <meta property="og:type" content="website"/>
                <meta property="og:url" content={baseUrl}/>
                <meta property="og:description"
                      content="An autonomous evolutionary trading card game"/>
                <meta property="og:image" content={deployUrl("og-image.png")}/>

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
                    {modeToggle && <Button style={{float: 'right'}} onClick={() => setLight(prev => !prev)}>{
                        light ? <LightMode/> : <DarkMode/>
                    }</Button>}
                    {children}
                </ThemeProvider>
                : children
            }
        </main>
    )
}

const styles = theme => ({
    "@global": {
        // MUI typography elements use REMs, so you can scale the global
        // font size by setting the font-size on the <html> element.
        html: {fontSize: "2vh"}
    }
})

export const Layout = withStyles(styles)(Layout0)