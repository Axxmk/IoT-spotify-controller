const { spotifyApi } = require("../routers/authorize-router.js")

const NEST = "b01403799b8fdbc0697308a61fa05e2d" // device name: Ann's nest
const RASPI = "e1edec44a5935c3408ba2a4dada65320e3b9aa1e" // device name: raspotify (ann-raspi)

module.exports = async () => {
    try {
        // Get active device
        const activeDevice = await new Promise((resolve, reject) => {
            spotifyApi
                .getMyDevices()
                .then((data) =>
                    resolve(data.body.devices.filter((d) => d.is_active)[0])
                )
                .catch((err) => reject("unable to get devices"))
        })

        // Tranfer playing device to rasberry pi
        if (
            activeDevice === undefined ||
            activeDevice.name !== "raspotify (ann-raspi)"
        ) {
            spotifyApi.transferMyPlayback([RASPI])
            console.log("transferring playback to " + RASPI)
        }

        return activeDevice
    } catch (err) {
        console.log(err)
    }
}
