import * as React from 'react'
import {Avatar, Box, Button, CircularProgress, Container, Grid, Link, TextField, Typography} from '@mui/material'
import {LockOutlined} from '@mui/icons-material'
import {createUser, forgotPassword, login} from "../src/client/userApi"
import {baseUrl, hohMail} from "./constants"
import MetaMaskButton from "./MetaMaskButton"
import {Moralis} from "moralis"
import {debug, log} from '../src/utils'

// @ts-ignore
let authenticate = Moralis.authenticate

function Copyright(props) {
    return (<Typography variant="body2" color="text.secondary" align="center" {...props}>
        {'Copyright © '}
        <Link color="inherit" href={baseUrl}>
            {baseUrl.substring(baseUrl.indexOf("//") + 2)}
        </Link>{' ' + new Date().getFullYear() + '.'}
    </Typography>)
}

export function SignIn({onSignedIn}) {
    const [busy, setBusy] = React.useState(false)
    const [message, setMessage] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")

    function loginOk(user) {
        setBusy(false)
        // TODO MORALIS bug with verification email :/
        const verified = user.emailVerified || user.get('accounts')?.length > 0
        log("verified user", verified)
        const grantAccessToHome = true // TODO!
        if (grantAccessToHome) {
            setMessage("Glad to have you! 😀 Redirecting... ⌛")
            onSignedIn && onSignedIn()
        } else {
            setMessage("Login correct 💪 Please verify your email address then login again 😀 Check your spam/unknown for a mail by " + hohMail)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        setBusy(true)

        setMessage("")
        login(email, password, user => {
            loginOk(user)
        }, (err, code) => {
            setBusy(false)
            console.log("code " + code + ", " + err)
            if (code === 101) {
                createUser(email, password, email, () => {
                    setMessage("Welcome 💪 Please check your emails (spam/unknown) for a mail by " + hohMail)
                }, (err, code) => {
                    console.log("CREATE", err)
                    if (code !== 202) {
                        setMessage(err)
                    } else {
                        setMessage("Invalid password")
                    }
                })
            } else {
                setMessage(err)
            }
        })
    }

    return (<Container component="main" maxWidth="xs">
        <Box sx={{
            marginTop: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
            <Avatar sx={{m: 1, bgcolor: 'secondary.main'}}>
                <LockOutlined/>
            </Avatar>
            <Typography component="h1" variant="h5">
                {'Start Playing HoH'}
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={x => setEmail(x.target.value)}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={x => setPassword(x.target.value)}
                />
                <Button
                    disabled={busy}
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{mt: 3, mb: 2}}
                >
                    Start
                </Button>

                <MetaMaskButton fullWidth
                                onClick={() => {
                                    authenticate().then(user => {
                                        debug("meta user", user)
                                        loginOk(user)
                                    })
                                }}
                >&nbsp; or Connect with MetaMask</MetaMaskButton>

                <Grid container>
                    <Grid item xs>
                        <Typography variant="body2" color="text.secondary" align="right"
                                    style={{marginRight: 4}}>
                            {'Forgot your password that email?'}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body2">
                            <Link href={"#"} onClick={() => {
                                setBusy(true)
                                forgotPassword(email, () => {
                                        setBusy(false)
                                        setMessage("Recovery mail sent! Check your inbox/unknown folders.")
                                    },
                                    e => {
                                        setBusy(false)
                                        setMessage(e)
                                    })
                            }} variant="body2">
                                {"Click here!"}
                            </Link>
                        </Typography>
                    </Grid>
                </Grid>
                <br/>
                {!message ? "" : <>{message}<br/></>}
            </Box>
            {busy && <div><CircularProgress/></div>}
        </Box>
        <Copyright/>
    </Container>)
}