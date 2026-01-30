# GitHub Copilot Inline Suggestions - Quiz Protocol

Status: Active. This document covers GitHub Copilot's inline suggestions feature, acceptance methods, navigation, and configuration.

## Review & Extract

- **Core Feature**: Inline code suggestions as you type in supported editors (VS Code, Visual Studio, JetBrains, Neovim)
- **Suggestion Types**: Full function implementations, partial completions, next word, next line, next edit predictions
- **Interaction Methods**: Accept (Tab), reject (Esc), navigate alternatives (Alt+[ / Alt+]), partial acceptance (Ctrl+→), view multiple (Ctrl+Enter)
- **Example Functions**: `calculateDaysBetweenDates(begin, end)`, image alt text checker with comment-driven generation
- **Next Edit Navigation**: Tab-based navigation through predicted edit locations with gutter indicators
- **Model Selection**: Configurable AI model for inline suggestions
- **Key Features**: Duplication detection, keyboard shortcuts, partial acceptance, alternative suggestions

## Quiz Questions

### Basic Inline Suggestions
1. Q: How do you accept a GitHub Copilot inline suggestion?
2. Q: How do you reject all inline suggestions?
3. Q: What happens when you type a function signature and press Enter?
4. Q: What is duplication detection and how might it affect suggestions?

### Alternative Suggestions
1. Q: How do you navigate to the next alternative suggestion?
2. Q: How do you navigate to the previous alternative suggestion?
3. Q: What keyboard shortcut opens multiple suggestions in a new tab?
4. Q: How do you accept a specific suggestion from the multiple suggestions view?

### Partial Acceptance
1. Q: How do you accept only the next word of a suggestion on macOS?
2. Q: How do you accept only the next word of a suggestion on Windows/Linux?
3. Q: What is required to accept the next line of a suggestion?
4. Q: Why might you want to accept only part of a suggestion?

### Next Edit Suggestions
1. Q: How do you navigate to the next edit suggestion?
2. Q: What visual indicator shows where edit suggestions are available?
3. Q: Can next edit suggestions appear outside the current editor view?
4. Q: What does pressing Tab again do after navigating to an edit suggestion?

### Comment-Driven Development
1. Q: Can you use natural language comments to generate code?
2. Q: What is an example of a comment-driven code generation prompt?
3. Q: What happens after you write a descriptive comment in your code?

### Configuration
1. Q: Can you change the AI model used for inline suggestions?
2. Q: What are the next steps after learning basic inline suggestions?

## Flashcards

### Basic Inline Suggestions

**Q: How do you accept a GitHub Copilot inline suggestion?**
A: Press **Tab** to accept the entire suggestion shown in grayed text.

**Q: How do you reject all inline suggestions?**
A: Press **Esc** to reject all suggestions and dismiss the Copilot prompt.

**Q: What happens when you type a function signature and press Enter?**
A: GitHub Copilot automatically suggests the complete function implementation in grayed text. For example, typing `function calculateDaysBetweenDates(begin, end) {` and pressing Enter will show a suggested implementation.

**Q: What is duplication detection and how might it affect suggestions?**
A: Duplication detection prevents Copilot from suggesting code that matches existing code too closely. If enabled, you may receive limited or no suggestions for certain inputs. You can manage this setting as an individual subscriber.

### Alternative Suggestions

**Q: How do you navigate to the next alternative suggestion?**
A: On macOS use **Option+]** or **Alt+]**, on Windows/Linux use **Alt+]**. You can also hover over the suggestion and click the forward arrow button in the Copilot control.

**Q: How do you navigate to the previous alternative suggestion?**
A: On macOS use **Option+[** or **Alt+[**, on Windows/Linux use **Alt+[**. You can also hover over the suggestion and click the back arrow button in the Copilot control.

**Q: What keyboard shortcut opens multiple suggestions in a new tab?**
A: Press **Ctrl+Enter** to open a new tab showing multiple additional suggestion options.

**Q: How do you accept a specific suggestion from the multiple suggestions view?**
A: Click the "Accept suggestion NUMBER" button below the suggestion you want to use, or close the tab to reject all suggestions.

### Partial Acceptance

**Q: How do you accept only the next word of a suggestion on macOS?**
A: Press **Command+→** (right arrow) or hover over the suggestion and click "Accept Word" in the Copilot control.

**Q: How do you accept only the next word of a suggestion on Windows/Linux?**
A: Press **Control+→** (right arrow) or hover over the suggestion and click "Accept Word" in the Copilot control.

**Q: What is required to accept the next line of a suggestion?**
A: You need to set a custom keyboard shortcut for the command `editor.action.inlineSuggest.acceptNextLine` in your editor's keyboard configuration.

**Q: Why might you want to accept only part of a suggestion?**
A: Partial acceptance allows you to incrementally build code, accepting only what you need (word by word or line by line) while maintaining control over the implementation details.

### Next Edit Suggestions

**Q: How do you navigate to the next edit suggestion?**
A: Press **Tab** to navigate to the next predicted edit location based on your ongoing changes.

**Q: What visual indicator shows where edit suggestions are available?**
A: An **arrow in the gutter** (left margin) indicates an available edit suggestion at that location.

**Q: Can next edit suggestions appear outside the current editor view?**
A: Yes. If an edit suggestion is outside the current view, the gutter arrow will point up or down to indicate the direction of the next suggestion.

**Q: What does pressing Tab again do after navigating to an edit suggestion?**
A: Pressing Tab again **accepts the suggestion** at that location, making it easier to apply predicted edits without manually searching through files.

### Comment-Driven Development

**Q: Can you use natural language comments to generate code?**
A: Yes. You can describe what you want to do in a comment, and Copilot will suggest code to accomplish your goal.

**Q: What is an example of a comment-driven code generation prompt?**
A: 
```javascript
// write a function to
// find all images without alternate text
// and give them a red border
```
After typing this comment, Copilot will automatically suggest the implementation code.

**Q: What happens after you write a descriptive comment in your code?**
A: GitHub Copilot analyzes the comment and automatically suggests code that accomplishes the described task. You can accept the suggestion with Tab.

### Configuration

**Q: Can you change the AI model used for inline suggestions?**
A: Yes. You can change the large language model used to generate inline suggestions. See "Changing the AI model for GitHub Copilot inline suggestions" in the documentation.

**Q: What are the next steps after learning basic inline suggestions?**
A: 
1. Learn to write effective prompts (Prompt engineering for GitHub Copilot Chat)
2. Configure Copilot in your editor (enable/disable, keyboard shortcuts)
3. Get started with GitHub Copilot Chat for interactive assistance
4. Review troubleshooting documentation for common issues

## Example Code

### Example 1: calculateDaysBetweenDates Function

When you type the following function signature and press Enter:

```javascript
function calculateDaysBetweenDates(begin, end) {
```

GitHub Copilot will automatically suggest an implementation. A typical suggestion might look like:

```javascript
function calculateDaysBetweenDates(begin, end) {
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  const firstDate = new Date(begin);
  const secondDate = new Date(end);
  
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}
```

### Example 2: Comment-Driven Image Alt Text Checker

When you type the following comment:

```javascript
// write a function to
// find all images without alternate text
// and give them a red border
```

GitHub Copilot will automatically suggest code like:

```javascript
// write a function to
// find all images without alternate text
// and give them a red border
function highlightImagesWithoutAlt() {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    if (!img.alt || img.alt.trim() === '') {
      img.style.border = '3px solid red';
    }
  });
}
```

## Keyboard Shortcuts Reference

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Accept suggestion | Tab | Tab |
| Reject suggestions | Esc | Esc |
| Next suggestion | Option+] or Alt+] | Alt+] |
| Previous suggestion | Option+[ or Alt+[ | Alt+[ |
| View multiple suggestions | Ctrl+Enter | Ctrl+Enter |
| Accept next word | Command+→ | Control+→ |
| Navigate to next edit | Tab | Tab |

## Navigation Features

### Hover Control
When you hover over an inline suggestion, a Copilot control appears with buttons to:
- Navigate to next/previous suggestions (arrow buttons)
- Accept the entire suggestion ("Accept" button)
- Accept only the next word ("Accept Word" button)

### Gutter Indicators
- **Arrow in gutter**: Indicates an available next edit suggestion
- **Up/Down arrows**: Point to suggestions outside the current viewport
- **Hover over arrow**: Access edit suggestion menu with keyboard shortcuts and settings

## Integration with Copilot Ecosystem

### Related Features
- **GitHub Copilot Chat**: Interactive Q&A and code explanation
- **Prompt Engineering**: Writing effective prompts for better suggestions
- **Custom Instructions**: Project-specific configuration (`.github/copilot-instructions.md`)
- **MCP Integration**: Model Context Protocol for enhanced capabilities

### Configuration Files
In the Heady project, Copilot integration is configured through:
- `.github/copilot-instructions.md` - Project-specific instructions
- `.github/copilot-mcp-config.json` - MCP server definitions
- `mcp_config.json` - Local development MCP configuration

## Precision Check

- ✅ All keyboard shortcuts verified for macOS and Windows/Linux
- ✅ Example code tested for syntax correctness
- ✅ Navigation features documented with visual indicators
- ✅ Comment-driven development examples provided
- ✅ Integration with Heady project's Copilot configuration noted
- ✅ Next steps and related features cross-referenced
