import React from 'react'
import {HohApiWrapper} from "../src/client/baseApi"
import Layout from "../components/Layout"
import CustomAutocomplete from "../components/CustomAutocomplete"
import {gameName} from '../components/constants'

export default function RealtimePage() {
    let [a, setA] = React.useState("")
    return <Layout title={gameName("Beta")} noCss mui>
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
        </HohApiWrapper>
    </Layout>
}
