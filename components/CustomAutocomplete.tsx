import * as React from 'react'
import {ReactNode} from 'react'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import {MenuItemFixed} from "./MenuItemFixed"

type CustomAutocompleteData = {
    label: string,
    options: { label: string, node: ReactNode }[],
    inputValue: string,
    setInputValue: (v: string) => void
}

export function CustomAutocomplete({label, options, inputValue, setInputValue}: CustomAutocompleteData) {
    const [value, setValue] = React.useState(undefined)
    return (
        <Autocomplete
            disablePortal
            value={value}
            onChange={(event, newValue) => {
                setValue(newValue)
            }}
            freeSolo
            autoHighlight={false}
            inputValue={inputValue}
            renderOption={(props, optionLbl) => {
                const option = options.find(x => x.label === optionLbl)
                return (
                    <MenuItemFixed component="li" sx={{'& > img': {mr: 2, flexShrink: 0}}} {...props}>
                        {option?.node}
                    </MenuItemFixed>
                )
            }}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue)
            }}
            options={options.map(x => x.label)}
            sx={{width: 300}}
            renderInput={(params) =>
                <TextField
                    {...params} label={label}/>}
        />
    )
}
