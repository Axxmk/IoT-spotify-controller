/* libraries */
require("dotenv").config()
const fs = require("fs")
const express = require("express")
const SpotifyWebApi = require("spotify-web-api-node")
const qs = require("qs")
const { nanoid } = require("nanoid")

/* variables */
const router = express.Router()
const { env } = process
// const CODE = fs.readFileSync(".code", "utf-8")

/* Setting credentials */
const spotifyApi = new SpotifyWebApi({
    clientId: env.CLIENT_ID,
    clientSecret: env.CLIENT_SECRET,
    redirectUri: env.REDIRECT_URI,
    refreshToken: env.REFRESH_TOKEN,
})
const scope = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "streaming",
    "app-remote-control",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "user-read-playback-state",
]
let state = null

/* Login to get Authorization code */
router.get("/login", (req, res) => {
    state = nanoid(16)

    return res.redirect(
        "https://accounts.spotify.com/authorize?" +
            qs.stringify({
                response_type: "code",
                client_id: env.CLIENT_ID,
                state: state,
                scope: scope.join(" "),
                redirect_uri: env.REDIRECT_URI,
            })
    )
})

/* Application requests refresh and access tokens */
router.get("/callback", (req, res) => {
    const code = req.query.code || null
    const state = req.query.state || null

    fs.writeFileSync("./.code", code, "utf-8")

    // Retrieve an access token and a refresh token
    console.log("Getting access token…")
    spotifyApi.authorizationCodeGrant(code).then(
        (data) => {
            // Set the access token on the API object to use it in later calls
            spotifyApi.setAccessToken(data.body["access_token"])
            spotifyApi.setRefreshToken(data.body["refresh_token"])

            // Store refresh token
            let content = fs.readFileSync(".env", "utf8")
            content = content.replaceAll(
                /REFRESH_TOKEN="(.*)+"/g,
                `REFRESH_TOKEN="${data.body["refresh_token"]}"`
            )
            fs.writeFileSync(".env", content, "utf8")

            res.send("Authorization is success :)")
        },
        (err) => {
            console.error(err)
            res.send("Something went wrong :(")
        }
    )
})

module.exports = { router, spotifyApi }
