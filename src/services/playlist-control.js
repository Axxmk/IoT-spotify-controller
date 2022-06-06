const { spotifyApi } = require("../routers/authorize-router.js");
const getActiveDevice = require("./get-active-device.js");

const DAY_PLAYLIST_ID = "6Bdg8UMO0uGSdN7OTDjqeH";
const NIGHT_PLAYLIST_ID = "0RMuRvxR1ABVF5HGSogGj0";

const playNightPlaylist = async () => {
    await getActiveDevice();
    return _playRandomSongInPlaylist(NIGHT_PLAYLIST_ID);
};

const playDayPlaylist = async () => {
    await getActiveDevice();
    return _playRandomSongInPlaylist(DAY_PLAYLIST_ID);
};

const _playRandomSongInPlaylist = async (playlistId) => {
    try {
        let { body: playlist } = await spotifyApi.getPlaylist(playlistId);
        await spotifyApi.play({
            context_uri: playlist.uri,
            offset: {
                position: Math.floor(Math.random() * playlist.tracks.total),
            },
        });
        await spotifyApi.setShuffle(true);
        console.log(`Playing ${playlist.name} playlist`);
    } catch (err) {
        console.error("Something went wrong:", err.message);
    }
};

module.exports = { playNightPlaylist, playDayPlaylist };
