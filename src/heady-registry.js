class HeadyRegistry {
  constructor() {
    this.components = {};
  }

  registerComponent(name, component) {
    this.components[name] = component;
  }

  classifyInput(input, source) {
    // Simple classification logic - can be enhanced
    let context = {
      project: 'default',
      component: 'unknown',
      urgency: 'normal'
    };

    // Example: Check for specific keywords
    if (input.includes('urgent') || source === 'admin') {
      context.urgency = 'high';
    }

    // Check for component-specific keywords
    Object.keys(this.components).forEach(componentName => {
      if (input.includes(componentName)) {
        context.component = componentName;
      }
    });

    return context;
  }
}

module.exports = new HeadyRegistry();
