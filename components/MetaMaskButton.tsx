import styled from '@emotion/styled'
import {Button} from '@mui/material'
import React from 'react'

const brandColors = {
    baseColor: '#000',
    hoverColor: '#4c4c4c',
    activeColor: '#999',
    foregroundColor: '#FFFFFF',
}

const MMStyledButton = styled(Button)`
  & {
    transition: all 0.15s ease;
  }

  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  && > svg.r-ff-icon {
    height: ${props => (props.size === 'small' ? '1rem' : '1.5rem')};
    width: ${props => (props.size === 'small' ? '1rem' : '1.5rem')};
    margin-right: 0.5rem;
    margin-bottom: -2px;
  }
`

const StyledButtonSolid = styled(MMStyledButton)`
  & {
    color: ${brandColors.foregroundColor};
    background: ${brandColors.baseColor};
  }

  &:hover {
    background-color: ${brandColors.hoverColor};
  }

  &:active {
    background-color: ${brandColors.activeColor};
  }
`

const StyledButtonOutline = styled(MMStyledButton)`
  & {
    color: #333;
    background: ${brandColors.foregroundColor};
    border: 1px solid #ccc;
  }

  &:hover {
    background-color: #f3f2f2;
  }

  &:active {
    background-color: #e4e4e4;
  }
`

const ButtonBody = ({children}) => (
    <React.Fragment>
        <img src="/metamask.svg" className={'r-ff-icon'} alt="metamask"/>
        {children}
    </React.Fragment>
)

export const MetaMaskButtonSolid = ({children, ...props}) => {
    return (
        <StyledButtonSolid  {...props}>
            <ButtonBody children={children}/>
        </StyledButtonSolid>
    )
}

export const MetaMaskButtonOutline = ({children, ...props}) => {
    return (
        <StyledButtonOutline  {...props}>
            <ButtonBody children={children}/>
        </StyledButtonOutline>
    )
}

const defaultProps = {
    width: 'auto',
    borderRadius: 1,
    boxShadow: 1,
}

MetaMaskButtonSolid.defaultProps = defaultProps
MetaMaskButtonOutline.defaultProps = defaultProps

export const MetaMaskButton = MetaMaskButtonSolid
