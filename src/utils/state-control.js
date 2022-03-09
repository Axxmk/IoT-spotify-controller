const { spotifyApi } = require("../routers/authorize-router.js")

const NEST = "b01403799b8fdbc0697308a61fa05e2d" // device name: Ann's nest
const RASPI = "e1edec44a5935c3408ba2a4dada65320e3b9aa1e" // device name: raspotify (ann-raspi)

const threshold = 9
let isPressed = false

/* Control play/pause state of the user's playback */
module.exports = async (distance) => {
    if (distance < threshold) {
        if (!isPressed) {
            console.log("I found u")
            isPressed = true

            try {
                // Get active device
                let devices = await spotifyApi.getMyDevices()
                let activeDevice = devices.body.devices.filter(
                    (d) => d.is_active
                )

                // Tranfer playing device to rasberry pi
                if (
                    activeDevice.length === 0 ||
                    activeDevice[0].name !== "raspotify (ann-raspi)"
                ) {
                    await spotifyApi.transferMyPlayback([RASPI])
                    console.log("transferring playback to " + RASPI)
                }

                // Get a user's current playback state
                let state = await spotifyApi.getMyCurrentPlaybackState()

                // Check state of the device
                if (state.body && state.body.is_playing) {
                    console.log("User is currently playing something")
                    await spotifyApi.pause()
                    console.log("Playback paused")
                } else {
                    console.log("User is not playing anything")
                    await spotifyApi.play()
                    console.log("Playback started")
                }
            } catch (err) {
                console.error("Something went wrong:", err.message)
            }
        }
    } else if (distance > 35) {
        isPressed = false
    }
}
