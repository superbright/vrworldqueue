var sockets = require("./sockets");
var scheduler = require("node-schedule");
var tasks = {};
exports.addToSchedule = (bayId, date, task) => {
    if (tasks[bayId] != null) {
        tasks[bayId].cancel();
        tasks[bayId] = null;
    }
    
    tasks[bayId] =  scheduler.scheduleJob(date, task);
    return tasks[bayId];
}