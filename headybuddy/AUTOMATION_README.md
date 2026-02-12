# HeadyBuddy Automation Engine

## 🤖 Overview

HeadyBuddy now includes a powerful Puppeteer-based automation engine that can handle web interactions, file uploads, and browser automation tasks. This transforms HeadyBuddy from a simple task companion into a full-featured automation assistant.

## 🚀 Features

### Core Capabilities
- **Browser Automation**: Full Puppeteer control with stealth mode
- **Colab Uploads**: Automated Google Colab notebook uploads
- **Screenshot Capture**: Take screenshots of any webpage
- **Form Filling**: Automated form submissions
- **GitHub Integration**: Repository creation and file management
- **Multi-page Management**: Handle multiple browser sessions simultaneously

### Built-in Workflows
1. **Colab Notebook Upload**: Automatically upload all 6 Heady notebooks to Google Colab
2. **GPU Runtime Setup**: Automatically enable GPU runtime for uploaded notebooks
3. **Link Generation**: Get shareable URLs for all uploaded notebooks

## 📦 Installation

The automation engine is included in HeadyBuddy v1.0+. Dependencies are automatically installed:

```bash
npm install
```

### Key Dependencies
- `puppeteer`: Browser automation engine
- `puppeteer-extra`: Enhanced Puppeteer with plugins
- `puppeteer-extra-plugin-stealth`: Avoid detection

## 🎮 Usage

### Via HeadyBuddy UI

1. Launch HeadyBuddy: `npm start`
2. Click the **Automation** section (🤖 icon)
3. Use any of these buttons:
   - **📋 List Notebooks**: Show available notebooks for upload
   - **📓 Upload to Colab**: Upload all notebooks to Google Colab
   - **📸 Screenshot**: Take a screenshot of current page
   - **🔒 Close Engine**: Safely close automation engine

### Programmatic Usage

```javascript
const HeadyBuddyAutomation = require('./automation-engine');

const automation = new HeadyBuddyAutomation();

// Initialize
await automation.init();

// Upload notebooks to Colab
const notebooks = automation.getAvailableNotebooks();
const results = await automation.uploadToColab(notebooks);

// Take screenshot
await automation.screenshot('default', 'my-screenshot.png');

// Cleanup
await automation.close();
```

## 🔧 Configuration

### Browser Settings
```javascript
const config = {
  headless: false,  // Show browser window
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage'
  ]
};
```

### Available Notebooks
The automation engine automatically detects these notebooks:
- HeadySoul GPU (`heady_soul_colab.ipynb`)
- JULES AI (`jules_node.ipynb`)
- OBSERVER Monitor (`NOTEBOOK_3_OBSERVER_Monitor.ipynb`)
- ATLAS Knowledge (`NOTEBOOK_4_ATLAS_Knowledge.ipynb`)
- Builder Node (`builder_node.ipynb`)
- Pythia Node (`pythia_node.ipynb`)

## 🎯 Colab Upload Workflow

The Colab upload automation handles:

1. **Authentication**: Waits for Google login if needed
2. **File Upload**: Uploads each notebook via file input
3. **GPU Runtime**: Automatically enables GPU acceleration
4. **Link Collection**: Captures notebook URLs for sharing
5. **Error Handling**: Continues on individual failures

### Expected Results
```javascript
{
  success: true,
  results: [
    {
      name: "HeadySoul GPU",
      url: "https://colab.research.google.com/drive/[ID]",
      success: true
    },
    // ... other notebooks
  ]
}
```

## 🛡️ Security & Privacy

### Stealth Mode
The automation engine uses `puppeteer-extra-plugin-stealth` to:
- Hide automation fingerprints
- Mimic human behavior patterns
- Avoid detection by anti-bot systems

### Data Handling
- **Local Processing**: All automation runs locally
- **No Cloud Storage**: Screenshots and data saved locally
- **Session Isolation**: Each automation task in separate browser context

## 🔍 Testing

Run the test suite to verify functionality:

```bash
node test-automation.js
```

Test coverage:
- ✅ Browser initialization
- ✅ Notebook detection
- ✅ Page creation
- ✅ Navigation
- ✅ Screenshot capture
- ✅ Cleanup procedures

## 🚨 Troubleshooting

### Common Issues

1. **Browser Launch Fails**
   ```bash
   # Install required dependencies
   sudo apt-get install -y libgbm-dev libxss1 libgconf-2-4
   ```

2. **Colab Upload Times Out**
   - Check internet connection
   - Verify Google account access
   - Ensure notebooks exist in expected directory

3. **Screenshot Fails**
   - Check write permissions
   - Verify page is loaded
   - Ensure browser window is visible

### Debug Mode
Enable detailed logging:
```javascript
const automation = new HeadyBuddyAutomation();
automation.debug = true;  // Enable console logging
```

## 🔄 API Reference

### Core Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `init()` | Initialize browser | Promise<boolean> |
| `createPage(name)` | Create new browser page | Promise<Page> |
| `uploadToColab(notebooks)` | Upload notebooks to Colab | Promise<Results> |
| `screenshot(pageName, filename)` | Take screenshot | Promise<string> |
| `closePage(pageName)` | Close specific page | Promise<void> |
| `close()` | Close all pages and browser | Promise<void> |

### Utility Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAvailableNotebooks()` | List available notebooks | Array<Notebook> |
| `enableGPU(page)` | Enable GPU runtime | Promise<void> |
| `fillForm(page, url, data)` | Fill web forms | Promise<void> |

## 🎨 UI Integration

The automation features are seamlessly integrated into HeadyBuddy's UI:

- **Automation Section**: Dedicated panel with action buttons
- **Status Updates**: Real-time feedback in chat
- **Progress Indicators**: Visual feedback during operations
- **Error Messages**: Clear error reporting

## 🚀 Future Enhancements

Planned automation features:
- [ ] **GitHub Integration**: Auto-create repos and push code
- [ ] **CI/CD Automation**: Trigger builds and deployments
- [ ] **Form Templates**: Pre-built form filling workflows
- [ ] **Scheduled Tasks**: Time-based automation triggers
- [ ] **Cloud Integration**: Direct cloud service interactions

## 📞 Support

For automation issues:
1. Check the test suite: `node test-automation.js`
2. Review console logs for detailed error messages
3. Verify notebook files exist in the expected directory
4. Ensure browser dependencies are installed

---

**HeadyBuddy Automation Engine** - Transforming your AI companion into a powerful automation assistant! 🤖✨
