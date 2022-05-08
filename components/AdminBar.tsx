import * as React from 'react'
import {styled, alpha} from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputBase from '@mui/material/InputBase'
import SearchIcon from '@mui/icons-material/Search'
import MoreIcon from '@mui/icons-material/MoreVert'
import {AdminPanelSettings, AllInbox, LogoutOutlined, People} from "@mui/icons-material"
import {useRouter} from "next/router"
import {signOut} from "../src/client/userApi"
import {Badge, LinearProgress, Link, Switch, Tooltip} from "@mui/material"
import {MenuFixed, MenuItemFixed} from "./MenuItemFixed"
import {Count} from "../interfaces/baseTypes"
import {Dispatch} from "react"

const Search = styled('div')(({theme}) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3), width: 'auto',
    },
}))

const SearchIconWrapper = styled('div')(({theme}) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}))

const StyledInputBase = styled(InputBase)(({theme}) => ({
    color: 'inherit', '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0), // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}))

type AdminBarProps = {
    user,
    count: Count,
    search: (s: string) => void,
    queryText: string,
    setQueryText: Dispatch<string>,
    isLoggedOut?: boolean,
    setLoggedOut: Dispatch<boolean>,
    loading: boolean,
    setPerson: Dispatch<boolean>,
    isPerson: boolean
}
export default function AdminBar({
                                     user,
                                     count,
                                     search,
                                     queryText,
                                     setQueryText,
                                     isLoggedOut,
                                     setLoggedOut,
                                     loading,
                                     setPerson,
                                     isPerson
                                 }: AdminBarProps) {
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null)

    function query(text) {
        setQueryText(text)
        // console.log("Search " + queryText)
        search(text)
    }

    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)
    const router = useRouter()
    const logoutClick = () => {
        signOut().then(() => {
            setLoggedOut(true)
            return router.push("/start", "/start")
        })
    }

    const handleUsers = () => {
        query("t:user ")
    }
    const handleCards = () => {
        query("t:card ")
    }
    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null)
    }
    const handleMobileMenuOpen = (event) => {
        setMobileMoreAnchorEl(event.currentTarget)
    }

    const menuId = 'primary-search-account-menu'
    const cardsBtn = <IconButton
        disabled={isLoggedOut}
        size="large"
        color="inherit"
        onClick={handleCards}>
        <Badge badgeContent={count?.cards} color="info">
            <Tooltip title={!count ? "" : count.objects + " objects, " + count.people + " people"}>
                <AllInbox/>
            </Tooltip>
        </Badge>
    </IconButton>
    const usersBtn = <IconButton
        disabled={isLoggedOut}
        size="large"
        color="inherit"
        onClick={handleUsers}>
        <Badge badgeContent={count?.users} color="info">
            <People/>
        </Badge>
    </IconButton>
    const logoutBtn = <IconButton
        disabled={isLoggedOut}
        size="large"
        edge="end"
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={logoutClick}
        color="inherit">
        <LogoutOutlined/>
    </IconButton>
    const mobileMenuId = 'primary-search-account-menu-mobile'
    const renderMobileMenu = (<MenuFixed
        anchorEl={mobileMoreAnchorEl}
        anchorOrigin={{
            vertical: 'top', horizontal: 'right',
        }}
        id={mobileMenuId}
        keepMounted
        transformOrigin={{
            vertical: 'top', horizontal: 'right',
        }}
        open={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
    >
        <MenuItemFixed>
            {cardsBtn}
            <p>Cards</p>
        </MenuItemFixed>
        <MenuItemFixed>
            {usersBtn}
            <p>Users</p>
        </MenuItemFixed>
        <MenuItemFixed onClick={logoutClick}>
            {logoutBtn}
            <p>Logout</p>
        </MenuItemFixed>
    </MenuFixed>)

    return (<Box sx={{flexGrow: 1}}>
        <AppBar position="static">
            <LinearProgress style={{opacity: loading ? 1 : 0}}/>
            <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    sx={{mr: 2}}
                    disabled={isLoggedOut}>
                    <AdminPanelSettings/>
                </IconButton>
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{display: {xs: 'none', sm: 'block'}}}>
                    HoH<span style={{fontSize: "50%"}}>ADMIN</span>
                </Typography>
                <Search>
                    <SearchIconWrapper>
                        <SearchIcon/>
                    </SearchIconWrapper>
                    <StyledInputBase
                        autoFocus
                        placeholder={"Search…"}
                        inputProps={{'aria-label': 'search'}}
                        onChange={e => setQueryText(e.target.value)}
                        value={queryText}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                query(queryText)
                            }
                        }}
                    />
                </Search>
                <Switch
                    onChange={(x, checked) => setPerson(checked)}
                    checked={isPerson} color="info"/>
                <Typography
                    fontSize="small"
                    component="div"
                    sx={{display: {xs: 'none', sm: 'block'}}}>
                    Person
                </Typography>
                <Box sx={{flexGrow: 1}}/>
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{display: {xs: 'none', sm: 'block'}}}>
                    {/*"isLoggedOut" + isLoggedOut}
                    {"loggedOut" + loggedOut*/}
                    {!user ?
                        <Typography variant="body2">
                            <Link href="/start" variant="body2" color="text.primary">
                                {"Login"}
                            </Link>
                        </Typography>
                        : <Typography
                            fontSize="small">{user.displayName ?? "?"}</Typography>
                    }
                </Typography>
                <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                    {cardsBtn}
                    {usersBtn}
                    {logoutBtn}
                </Box>
                <Box sx={{display: {xs: 'flex', md: 'none'}}}>
                    <IconButton
                        disabled={isLoggedOut}
                        size="large"
                        aria-controls={mobileMenuId}
                        aria-haspopup="true"
                        onClick={handleMobileMenuOpen}
                        color="inherit"
                    >
                        <MoreIcon/>
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
        {renderMobileMenu}
    </Box>)
}
