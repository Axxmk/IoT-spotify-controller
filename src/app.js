/* libraries */
const express = require("express");
const pigpio = require("pigpio");
const ads1x15 = require("ads1x15");
const RPiGPIOButtons = require("rpi-gpio-buttons");
const { default: DistanceMeter } = require("hc-sr04-pi");

/* routers */
const {
    router: authorizeRouter,
    spotifyApi,
} = require("./routers/authorize-router.js");

/* services */
const stateControl = require("./services/state-control.js");
const playbackControl = require("./services/playback-control.js");
const {
    playNightPlaylist,
    playDayPlaylist,
} = require("./services/playlist-control.js");

/* utils */
const refreshToken = require("./utils/refresh-token.js");
const cronSchedule = require("./utils/cron-schedule.js");

/* variables */
const app = express();
const PORT = 8080;

/* Set up */
app.use("/", authorizeRouter);

/* Refresh acess token when start running the app */
refreshToken();
/* Optains new access token at minute 45th */
cronSchedule("*/45 * * * *", refreshToken, "optaining access_token...");

/* Main function */
(async () => {
    const distanceMeter = new DistanceMeter(23, 24);

    const adc = new ads1x15(0x01);
    await adc.openBus(1); // open i2c bus. 0 for /dev/i2c-0 and 1 for /dev/i2c-1

    // GPIO pin numbers for the buttons
    const NIGHT = 17;
    const DAY = 27;
    // Create a configured instance
    let buttons = new RPiGPIOButtons({ pins: [NIGHT, DAY] });
    // Watch for button events
    buttons
        .on("pressed", (pin) => {
            switch (pin) {
                case NIGHT:
                    playNightPlaylist();
                    break;

                case DAY:
                    playDayPlaylist();
                    break;
            }
        })
        .on("error", (error) => {
            console.log("ERROR", error);
        })
        .on("debug", (debug) => {
            console.log("DEBUG", debug);
        })
        .on("button_event", (type, pin) => {
            console.log(`button_event ${type} on ${pin}`);
        });

    // Initialize the new instance to start monitoring the buttons
    buttons.init().catch((error) => {
        console.log("ERROR", error.stack);
        process.exit(1);
    });

    while (1) {
        // Get distance from Ultrasonic Sensor
        let distance = await distanceMeter.getDistance();
        distance = Math.round(distance);

        await Promise.all([stateControl(distance), playbackControl(adc)]);

        // Delay 50 ms
        await new Promise((resolve) => {
            setTimeout(() => resolve(), 50);
        });
    }
})();

/* App listening */
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
