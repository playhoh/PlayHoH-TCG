import * as React from 'react'
import {styled} from '@mui/material/styles'
import Tooltip, {tooltipClasses} from '@mui/material/Tooltip'
import {TooltipProps} from "@mui/material/Tooltip/Tooltip"

export const SimpleTooltip = styled(({className, ...props}: TooltipProps) => (
    props.title ? <Tooltip title={props.title} {...props} classes={{popper: className}}
                           PopperProps={{disablePortal: true}}>
        {props.children}
    </Tooltip> : props.children
))(({theme}) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: 'transparent',
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: 220,
        fontSize: theme.typography.pxToRem(12),
        border: 'none',
    },
}))