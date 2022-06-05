const { spotifyApi } = require("../routers/authorize-router.js");
const getActiveDevice = require("./get-active-device.js");

let isSkip = false;
let isSetVolume = false;
let volume = 0;

/* Control playback (set volume, skip) */
module.exports = async (adc) => {
    const valueY = await adc.readSingleEnded({ channel: 2 });
    const valueX = await adc.readSingleEnded({ channel: 3 });

    if (!isSkip) {
        if (valueX < 500) {
            spotifyApi.skipToPrevious().then(
                () => {
                    console.log("Skip to previous");
                },
                (err) => {
                    console.log("Something went wrong!", err.message);
                }
            );
            await getActiveDevice();
            isSkip = true;
        } else if (valueX > 3000) {
            spotifyApi.skipToNext().then(
                () => {
                    console.log("Skip to next");
                },
                (err) => {
                    console.log("Something went wrong!", err.message);
                }
            );
            await getActiveDevice();
            isSkip = true;
        }
    } else if (valueX > 500 && valueX < 3000) {
        isSkip = false;
    }

    if ((valueY > 2500 || valueY < 500) && !isSetVolume) {
        const activeDevice = await getActiveDevice();
        volume = activeDevice.volume_percent;
        isSetVolume = true;
    } else if (valueY > 500 && valueY < 2500) {
        isSetVolume = false;
    }

    if (isSetVolume) {
        if (valueY > 2500 && volume > 2) volume -= 3;
        else if (valueY < 500 && volume < 98) volume += 3;
        else return;

        try {
            await new Promise((resolve, reject) => {
                spotifyApi.setVolume(volume).then(
                    () => {
                        console.log("Setting volume to ", volume);
                        resolve();
                    },
                    (err) => {
                        //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
                        reject("Something went wrong! " + err.message);
                    }
                );
            });
        } catch (e) {
            console.log(e.message);
        }
    }
};
