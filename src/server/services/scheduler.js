var sockets = require("./sockets");
var scheduler = require("node-schedule");
exports.addToSchedule = (bayId, date, task) => {
    return scheduler.scheduleJob(date, task);
}