```
╔══════════════════════════════════════════════════════════════╗
║              HEADY APPLICATION TEMPLATES                     ║
║                                                              ║
║     💖 Made with Love by HeadyConnection & HeadySystems     ║
║                        Team 💖                               ║
╚══════════════════════════════════════════════════════════════╝
```

# Heady Application Templates

## Available Templates

### **1. MCP Service Template** (`mcp-service-template.js`)
```
📥 REQUEST → 🔧 PROCESS → 📤 RESPONSE
```

**Use For:**
- Creating new MCP protocol services
- Adding custom tools to Heady ecosystem
- Extending MCP capabilities

**Features:**
- ✅ Full MCP SDK integration
- ✅ Tool registration
- ✅ Error handling
- ✅ Stdio transport
- ✅ Event handling

**How to Use:**
```bash
# 1. Copy template
cp templates/mcp-service-template.js mcp-servers/heady-myservice/server.js

# 2. Replace placeholders
# [SERVICE_NAME] → HeadyMyService
# [service-name] → heady-myservice
# [service_name] → heady_myservice

# 3. Implement your tools
# Add tools in setupToolHandlers()
# Add handlers for each tool

# 4. Add to mcp_config.json
{
  "mcpServers": {
    "heady-myservice": {
      "command": "node",
      "args": ["./mcp-servers/heady-myservice/server.js"]
    }
  }
}

# 5. Test
node mcp-servers/heady-myservice/server.js
```

---

### **2. Express API Template** (`express-api-template.js`)
```
📥 REQUEST → 🔐 AUTH → 🔧 PROCESS → 📤 RESPONSE
```

**Use For:**
- Creating new REST API services
- Building microservices
- Adding HTTP endpoints

**Features:**
- ✅ Gzip compression
- ✅ Security headers (Helmet)
- ✅ CORS support
- ✅ Rate limiting
- ✅ Authentication
- ✅ Error handling
- ✅ Async/await support

**How to Use:**
```bash
# 1. Copy template
cp templates/express-api-template.js services/my-api/server.js

# 2. Replace [SERVICE_NAME] with your service name

# 3. Add your endpoints
app.get('/api/myendpoint', authenticate, asyncHandler(async (req, res) => {
  // Your logic
  res.json({ ok: true, data: {} });
}));

# 4. Configure environment
PORT=3001
API_KEY=your-api-key

# 5. Start service
node services/my-api/server.js
```

---

### **3. Task Processor Template** (`task-processor-template.js`)
```
📥 RECEIVE → 🎯 VALIDATE → 🔧 PROCESS → ✅ COMPLETE
```

**Use For:**
- Creating background task processors
- Building job workers
- Processing queued tasks

**Features:**
- ✅ Event-driven (EventEmitter)
- ✅ Timeout handling
- ✅ Retry logic
- ✅ Metrics tracking
- ✅ Concurrency control
- ✅ Error handling

**How to Use:**
```bash
# 1. Copy template
cp templates/task-processor-template.js src/my-processor.js

# 2. Replace [PROCESSOR_NAME] with your processor name

# 3. Implement execute() method
async execute(task) {
  switch (task.type) {
    case 'my-task-type':
      return await this.handleMyTask(task);
    default:
      throw new Error(`Unknown task type: ${task.type}`);
  }
}

# 4. Integrate with RoutingOptimizer
const processor = new MyProcessor();
routingOptimizer.on('task-routed', async (task) => {
  await processor.processTask(task);
});

# 5. Monitor metrics
console.log(processor.getMetrics());
```

---

## Template Usage Patterns

### **Pattern 1: MCP Service**
```javascript
// Create new MCP service
class HeadyAnalyticsServer {
  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'heady_analyze_code',
          description: 'Analyze code quality',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: { type: 'string' }
            }
          }
        }
      ]
    }));
  }
  
  async handleAnalyzeCode(args) {
    // Analysis logic
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
```

### **Pattern 2: Express API**
```javascript
// Add new endpoints
app.post('/api/process', authenticate, asyncHandler(async (req, res) => {
  const { data } = req.body;
  
  // Validate
  if (!data) throw { status: 400, message: 'Data required' };
  
  // Process
  const result = await processData(data);
  
  // Return
  res.json({ ok: true, result });
}));
```

### **Pattern 3: Task Processor**
```javascript
// Create specialized processor
class DataCleanupProcessor extends TaskProcessor {
  async execute(task) {
    if (task.type === 'cleanup-duplicates') {
      return await this.cleanupDuplicates(task.data);
    }
  }
  
  async cleanupDuplicates(files) {
    // Cleanup logic
    return { removed: files.length };
  }
}
```

---

## Integration with Heady Ecosystem

### **Connect to HeadyManager**
```javascript
// In heady-manager.js
const MyService = require('./services/my-service');
const myService = new MyService();

// Expose via API
app.get('/api/myservice/status', (req, res) => {
  res.json(myService.getStatus());
});
```

### **Connect to RoutingOptimizer**
```javascript
// Route tasks to your processor
routingOptimizer.on('task-routed', async (task) => {
  if (task.category === 'my-category') {
    await myProcessor.processTask(task);
  }
});
```

### **Connect to HeadyMaid**
```javascript
// Listen to HeadyMaid events
headyMaid.on('opportunities-detected', (opportunities) => {
  // Process opportunities
  opportunities.duplicates.forEach(dup => {
    myProcessor.processTask({
      type: 'cleanup',
      data: dup
    });
  });
});
```

---

## Best Practices

### **Performance**
- ✅ Use compression middleware
- ✅ Implement caching where appropriate
- ✅ Use async/await (no blocking operations)
- ✅ Add timeout handling
- ✅ Implement retry logic

### **Security**
- ✅ Always use authentication
- ✅ Validate all inputs
- ✅ Use Helmet for security headers
- ✅ Implement rate limiting
- ✅ Log security events

### **Reliability**
- ✅ Add error handling
- ✅ Implement circuit breakers
- ✅ Use graceful shutdown
- ✅ Add health checks
- ✅ Track metrics

### **Observability**
- ✅ Emit events for tracking
- ✅ Log important operations
- ✅ Track performance metrics
- ✅ Integrate with HeadyMaid
- ✅ Add to audit trail

---

## Quick Start

### **Create New MCP Service**
```bash
# 1. Copy template
cp templates/mcp-service-template.js mcp-servers/heady-newservice/server.js

# 2. Edit and customize
code mcp-servers/heady-newservice/server.js

# 3. Add to config
# Edit mcp_config.json

# 4. Test
node mcp-servers/heady-newservice/server.js
```

### **Create New API Service**
```bash
# 1. Copy template
cp templates/express-api-template.js services/new-api/server.js

# 2. Customize
code services/new-api/server.js

# 3. Set environment
export PORT=3001
export API_KEY=your-key

# 4. Start
node services/new-api/server.js
```

### **Create New Task Processor**
```bash
# 1. Copy template
cp templates/task-processor-template.js src/my-processor.js

# 2. Implement execute() method
code src/my-processor.js

# 3. Integrate with RoutingOptimizer
# Add to heady-manager.js

# 4. Test
node -e "require('./src/my-processor.js')"
```

---

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    💖 Made with Love 💖                      ║
║                                                              ║
║           by HeadyConnection & HeadySystems Team             ║
║                                                              ║
║              Crafted with Care • Built with Passion          ║
║                                                              ║
║    🌟 Sacred Geometry • AI Sovereignty • Data Harmony 🌟    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Templates Ready for Use** ✅
