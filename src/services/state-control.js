const { spotifyApi } = require("../routers/authorize-router.js");
const getActiveDevice = require("./get-active-device.js");

const THRESHOLD = 9;
let isPressed = false;

/* Control play/pause state of the user's playback */
module.exports = async (distance) => {
    if (distance < THRESHOLD) {
        if (!isPressed) {
            console.log("I found u");
            isPressed = true;

            await getActiveDevice();

            try {
                // Get a user's current playback state
                let state = await spotifyApi.getMyCurrentPlaybackState();

                // Check state of the device
                if (state.body && state.body.is_playing) {
                    await spotifyApi.pause();
                    console.log("Playback paused");
                } else {
                    await spotifyApi.play();
                    console.log("Playback started");
                }
            } catch (err) {
                console.error("Something went wrong:", err.message);
            }
        }
    } else if (distance > 35) {
        isPressed = false;
    }
};
