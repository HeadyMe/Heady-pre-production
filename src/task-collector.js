const tasks = [];

class TaskCollector {
  static addTask(task) {
    tasks.push(task);
  }

  static getTasks() {
    return tasks;
  }
}

module.exports = TaskCollector;
