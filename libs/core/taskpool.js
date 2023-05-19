const pLimit = require('p-limit');

class TaskPool {
  constructor(limit=24) {
    this.tasks = [];
    this.progress = 0;
    this.totalProgress = 0;

    this.limit = pLimit(limit);

    // this.start = undefined;

    this.tasks = [];

    this.onupdate = (progress, total) => {};
  }

  addTask(handle, progress) {
    this.totalProgress += progress;
    let that = this;
    this.tasks.push(this.limit(async function() {
      await handle();
      that.progress += progress;
      that.onupdate(that.progress, that.totalProgress);
    }));
  }

  execute() {
    // this.start = new Date();
    return Promise.all(this.tasks);
  }
}

module.exports = TaskPool;