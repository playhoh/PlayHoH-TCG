import React from 'react'
import {HohApiWrapper} from "../src/client/baseApi"
import Layout from "../components/Layout"
import CustomAutocomplete from "../components/CustomAutocomplete"

export default function RealtimePage() {
    const [isBrowser, setBrowser] = React.useState(false)
    React.useEffect(() => {
        setBrowser(process.browser)
    })
    let [a, setA] = React.useState("")
    return <Layout title="Heroes of History TCG" noCss mui>
        {!isBrowser ? "" :
            <HohApiWrapper>
                {/*<GameLog/>*/}
                <div>
                    <CustomAutocomplete
                        options={[{label: "a", node: "a"}, {label: "b", node: "b"}, {label: "c", node: "c"}]}
                        label={"Select"}
                        inputValue={a}
                        setInputValue={setA}
                    />
                </div>
            </HohApiWrapper>}
    </Layout>
}
