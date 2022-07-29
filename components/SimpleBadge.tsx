import * as React from 'react'
import {Badge, BadgeProps} from "@mui/material"

export interface SimpleBadgeProps extends BadgeProps {
    left?: boolean,
}

export const SimpleBadge = (props: SimpleBadgeProps) =>
    <Badge {...props}
           anchorOrigin={{
               vertical: "bottom",
               horizontal: props.left ? "left" : "right"
           }}/>
