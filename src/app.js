/* libraries */
const express = require("express")
const cron = require("node-cron")
const pigpio = require("pigpio")
const { default: DistanceMeter } = require("hc-sr04-pi")

/* routers */
const {
    router: authorizeRouter,
    spotifyApi,
} = require("./routers/authorize-router.js")

/* utils function */
const stateControl = require("./utils/state-control.js")
const playbackControl = require("./utils/playback-control.js")

/* variables */
const app = express()
const port = 8080

/* Set up */
app.use("/", authorizeRouter)

/* Refresh acess token when start running the app */
// clientId, clientSecret and refreshToken has been set on the spotifyApi object.
spotifyApi.refreshAccessToken().then(
    (data) => {
        // Save the access token so that it's used in future calls
        spotifyApi.setAccessToken(data.body["access_token"])
        console.log("The access token has been refreshed from start :)")
    },
    (err) => {
        console.log("Could not refresh access token:", err)
    }
)

/* Optains new access token every 45 minutes */
cron.schedule("*/45 * * * *", () => {
    console.log("optaining access_token...")
    spotifyApi.refreshAccessToken().then(
        (data) => {
            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body["access_token"])
            console.log("The access token has been refreshed :)")
        },
        (err) => {
            console.log("Could not refresh access token:", err)
        }
    )
}).start()

const distanceMeter = new DistanceMeter(23, 24)

/* Main function */
setInterval(() => {
    ;(async () => {
        // Get distance from Ultrasonic Sensor
        let distance = await distanceMeter.getDistance()
        distance = Math.round(distance)

        stateControl(distance)
        playbackControl()
    })()
}, 100)

/* App listening */
app.listen(port, () => {
    console.log(`listening on port ${port}`)
})
