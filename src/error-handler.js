class ErrorHandler {
  static handleConductorError(error, task) {
    console.error(`Conductor error on task ${task.id}:`, error);
    // Additional error handling logic can be added here
  }
}

module.exports = ErrorHandler;
