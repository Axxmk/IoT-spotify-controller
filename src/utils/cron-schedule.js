const cron = require("node-cron");

module.exports = (time, cb, message) => {
    cron.schedule(time, () => {
        console.log(message);
        cb();
    }).start();
};
