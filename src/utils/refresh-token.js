const { spotifyApi } = require("../routers/authorize-router.js");

module.exports = () => {
    spotifyApi.refreshAccessToken().then(
        (data) => {
            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body["access_token"]);
            console.log("The access token has been refreshed :)");
        },
        (err) => {
            console.log("Could not refresh access token:", err);
        }
    );
};
