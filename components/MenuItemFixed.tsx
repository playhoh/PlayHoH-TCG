import * as React from 'react'
import MenuItem from '@mui/material/MenuItem'
import {Menu, Select, Theme} from "@mui/material"
import {makeStyles, useTheme} from "@mui/styles"

const useStyles = makeStyles({
    icon: {
        fill: "silver"
    },
})

export function SelectFixed(props) {
    const classes = useStyles()
    return <Select
        MenuProps={{MenuListProps: {disablePadding: true}}}
        inputProps={{
            classes: {icon: classes.icon}
        }} {...props} />
}

export function MenuFixed(props) {
    return <Menu MenuListProps={{disablePadding: true}} {...props} />
}

export function MenuItemFixed(props) {
    const theme = useTheme<Theme>()
    const option = {
        color: theme.palette.text, background: theme.palette.background.default
    }
    return <MenuItem style={option} {...props} />
}