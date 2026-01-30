# GitHub Copilot Inline Suggestions Demonstrations

This directory contains example JavaScript files that demonstrate GitHub Copilot's inline suggestion capabilities.

## Files

### `date-calculator.js`
Demonstrates how Copilot suggests complete function implementations when you type function signatures.

**Featured function**: `calculateDaysBetweenDates(begin, end)`

**Key demonstrations**:
- Automatic suggestion of complete function body
- Date manipulation and calculation logic
- Additional helper functions for business days and formatted output

**Try it yourself**:
1. Open the file in VS Code with GitHub Copilot enabled
2. Type a new function signature like `function calculateAge(birthDate) {`
3. Press Enter and watch Copilot suggest the implementation
4. Press Tab to accept or Alt+] to see alternatives

### `image-alt-checker.js`
Demonstrates comment-driven development where Copilot generates code from natural language comments.

**Featured comment**:
```javascript
// write a function to
// find all images without alternate text
// and give them a red border
```

**Key demonstrations**:
- Natural language to code conversion
- DOM manipulation suggestions
- Accessibility checking logic
- Multiple related functions generated from similar comments

**Try it yourself**:
1. Open the file in VS Code with GitHub Copilot enabled
2. Type a descriptive comment like `// create a function to validate email addresses`
3. Press Enter and Copilot will suggest the implementation
4. Press Tab to accept the suggestion

## Usage in Browser

You can test the image alt checker in any web page:

1. Open your browser's developer console (F12)
2. Copy and paste the content of `image-alt-checker.js`
3. Run `window.ImageAltChecker.createAccessibilityOverlay()`
4. Click "Highlight Issues" to see images without alt text

Or use the included test page:
1. Open `test-image-alt.html` in your browser
2. Click "Run Tests" to see the checker in action
3. Observe highlighted images and the accessibility overlay

## Usage in Node.js

You can use the date calculator in Node.js:

```javascript
const { calculateDaysBetweenDates, formatDateDifference } = require('./date-calculator.js');

const days = calculateDaysBetweenDates('2024-01-01', '2024-12-31');
console.log(`Days: ${days}`);

const formatted = formatDateDifference('2024-01-01', '2024-06-15');
console.log(`Difference: ${formatted}`);
```

## Learning Resources

For comprehensive documentation about GitHub Copilot inline suggestions, see:
- [`/docs/copilot-inline-suggestions.md`](../../docs/copilot-inline-suggestions.md) - Complete guide with Quiz Protocol
- [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md) - Project-specific Copilot configuration
- [Official GitHub Copilot Documentation](https://docs.github.com/en/copilot)

## Keyboard Shortcuts Quick Reference

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Accept suggestion | Tab | Tab |
| Reject suggestion | Esc | Esc |
| Next alternative | Option+] | Alt+] |
| Previous alternative | Option+[ | Alt+[ |
| Multiple suggestions | Ctrl+Enter | Ctrl+Enter |
| Accept next word | Command+→ | Control+→ |

## Tips for Getting Better Suggestions

1. **Write clear function signatures** - Use descriptive names and parameter names
2. **Use type hints** - Add JSDoc comments with parameter types
3. **Write detailed comments** - Explain what you want to accomplish
4. **Provide context** - Include related code nearby
5. **Iterate with alternatives** - Use Alt+] to explore different approaches
6. **Accept partially** - Use Command+→/Control+→ to accept word by word

## Related Features

- **GitHub Copilot Chat** - Ask questions and get explanations
- **Next Edit Suggestions** - Navigate predicted edit locations with Tab
- **Prompt Engineering** - Learn to write effective prompts
- **Model Selection** - Choose different AI models for suggestions

## Contributing

When adding new demonstration files:
1. Follow the existing file structure
2. Include clear comments explaining the feature being demonstrated
3. Provide "Try it yourself" instructions
4. Add usage examples for both browser and Node.js where applicable
5. Update this README with the new file information
