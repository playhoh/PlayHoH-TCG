import React from "react"
import Head from "next/head"
import {baseGameName} from "../components/constants"

export default function IssuePage() {
    const redirect = "https://github.com/playhoh/PlayHoH-TCG/issues/new?assignees=&labels=&template=bug_report.md&title="
    return !process.browser ? "" : <div style={{}}>
        <Head>
            <meta http-equiv="refresh" content={"0; URL=" + redirect}/>
            <title>{baseGameName} Issue</title>
        </Head>
        <h3 onLoad={() => window.location.href = redirect}>
            {'Redirecting to '} <a style={{}} href={redirect}>{redirect}</a> ...
        </h3>
    </div>
}
