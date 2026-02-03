class DefaultMCPService {
  async handle(task) {
    // Simple echo service for demonstration
    return {
      status: 'success',
      input: task.input,
      processedAt: new Date()
    };
  }
}

module.exports = new DefaultMCPService();
