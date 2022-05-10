import * as React from 'react'
import {Avatar, Button, TextField, Link, Grid, Box, Typography, Container} from '@mui/material'
import {LockOutlined} from '@mui/icons-material'
import {createUser, forgotPassword, login} from "../src/client/userApi"
import {hohMail} from "./constants"
import {useRouter} from "next/router"

function Copyright(props) {
    return (<Typography variant="body2" color="text.secondary" align="center" {...props}>
        {'Copyright © '}
        <Link color="inherit" href="https://playhoh.com/">
            playhoh.com
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
    </Typography>)
}

export default function SignIn() {
    const [game, setGame] = React.useState(false)
    const [message, setMessage] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")

    const [user, setUser] = React.useState(undefined)
    const router = useRouter()

    const handleSubmit = (e) => {
        e.preventDefault()

        setGame(false)
        setMessage("")
        login(email, password, user => {
            setUser(user)
            if (user.emailVerified) {
                setMessage("Glad to have you! 😌 Start playing! 💪")
                setGame(true)

                // router.push("/now", "/now", {shallow: true})
            } else {
                setMessage("Login correct 💪 Please verify your email address then login again 😌 Check your spam/unknown for a mail by " + hohMail)
            }
        }, (err, code) => {
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
        <Box
            sx={{
                marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}
        >
            <Avatar sx={{m: 1, bgcolor: 'secondary.main'}}>
                <LockOutlined/>
            </Avatar>
            <Typography component="h1" variant="h5">
                {'Start playing'}
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
                {/*<FormControlLabel
                        control={<Checkbox value="remember" color="primary"/>}
                        label="Remember me"
                    />*/}
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{mt: 3, mb: 2}}
                >
                    Start
                </Button>
                <Grid container>
                    <Grid item xs>
                        <Typography variant="body2" color="text.secondary" align="right"
                                    style={{marginRight: 4}}>
                            {'Forgot your password for the email above?'}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body2">
                            <Link href={"#"} onClick={() => {
                                forgotPassword(email, () =>
                                        setMessage("Recovery mail sent! Check your inbox/unknown folders."),
                                    e => setMessage(e))
                            }} variant="body2">
                                {"Click here!"}
                            </Link>
                        </Typography>
                    </Grid>
                </Grid>
                <br/>
                {message}
                {!game ? "" : <><br/><Link href="./now">{'Try the online beta!'}</Link> | <Link
                    href="./solo">{'Or learn how to play!'}</Link></>}
            </Box>
        </Box>

        <Copyright sx={{mt: 8, mb: 4}}/>
    </Container>)
}