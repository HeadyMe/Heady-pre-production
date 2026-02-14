# HeadyBuddy Chat Widget - Installation Guide

## Overview

The HeadyBuddy Chat Widget is a universal, embeddable chat component that provides AI assistance across all Heady ecosystem websites. It connects to the central HeadyBot intent resolution system and can be deployed on any website with a simple script tag.

## Features

- **Universal Design**: Works on any website with consistent branding
- **Intent Resolution**: Powered by 3-stage AI intent matching
- **Skill Execution**: Can execute system commands and provide real-time assistance
- **Responsive**: Mobile-friendly with adaptive sizing
- **Theme Integration**: Matches Heady ecosystem design language
- **Cross-Site Context**: Maintains conversation context across domains

## Quick Installation

### Method 1: Auto-Initialize (Recommended)

Add this to any page's `<body>`:

```html
<!-- HeadyBuddy Chat Widget -->
<script src="https://headybot.com/_shared/heady-buddy-widget.js"></script>
<script>
  // Auto-initialize with default settings
  new HeadyBuddyWidget({
    position: 'bottom-right',
    autoOpen: false,
    showBranding: true,
    siteContext: window.location.hostname,
    apiEndpoint: 'https://headybot.com'
  });
</script>
```

### Method 2: Data Attributes

Add this to any page's `<body>`:

```html
<div data-heady-buddy 
     data-position="bottom-right" 
     data-auto-open="false"
     data-branding="true"
     data-context="your-site.com"></div>

<script src="https://headybot.com/_shared/heady-buddy-widget.js"></script>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | string | 'bottom-right' | Widget position: 'bottom-right', 'bottom-left', 'top-right', 'top-left' |
| `autoOpen` | boolean | false | Automatically open chat on page load |
| `showBranding` | boolean | true | Show "Powered by HeadyBuddy" branding |
| `siteContext` | string | current domain | Site identifier for context-aware responses |
| `apiEndpoint` | string | current origin | Backend API endpoint for chat resolution |

## Advanced Usage

### Custom Styling

The widget uses CSS custom properties that can be overridden:

```css
:root {
  --hb-accent: #06b6d4;
  --hb-accent2: #8b5cf6;
  --hb-bg: #0c0c1a;
  --hb-surface: #141428;
  --hb-border: #1e1e3a;
  --hb-text: #e4e4f0;
  --hb-text2: #9494b0;
}
```

### Programmatic Control

```javascript
const widget = new HeadyBuddyWidget();

// Open/close chat
widget.open();
widget.close();
widget.toggle();

// Send messages programmatically
widget.addMessage("Hello!", false);

// Clear chat history
widget.clearMessages();

// Get message history
const messages = widget.getMessages();

// Destroy widget
widget.destroy();
```

### Event Handling

```javascript
const widget = new HeadyBuddyWidget();

// Listen for messages
widget.on('message', (message, isBot) => {
  console.log('New message:', message, isBot);
});

// Listen for skill execution
widget.on('skill:execute', (skill, params) => {
  console.log('Executing skill:', skill, params);
});
```

## Integration Examples

### WordPress

Add to your theme's `footer.php`:

```php
<?php if (!is_admin()): ?>
<script src="https://headybot.com/_shared/heady-buddy-widget.js"></script>
<script>
  new HeadyBuddyWidget({
    siteContext: '<?php echo get_site_url(); ?>'
  });
</script>
<?php endif; ?>
```

### React Component

```jsx
import { useEffect, useRef } from 'react';

function HeadyBuddyWidget({ siteContext }) {
  const widgetRef = useRef(null);
  
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://headybot.com/_shared/heady-buddy-widget.js';
    script.async = true;
    document.body.appendChild(script);
    
    script.onload = () => {
      widgetRef.current = new window.HeadyBuddyWidget({
        siteContext
      });
    };
    
    return () => {
      if (widgetRef.current) {
        widgetRef.current.destroy();
      }
    };
  }, [siteContext]);
  
  return null;
}
```

## Backend Requirements

The widget requires the HeadyBot chat API to be available at the configured `apiEndpoint`. The API should implement:

- `POST /api/v1/chat/resolve` - Intent resolution
- `POST /api/v1/chat/learn` - Preference learning
- `GET /api/v1/chat/stats` - Usage statistics

## Security Considerations

- All API calls are made over HTTPS
- User IDs are automatically generated and anonymized
- No sensitive data is stored in the browser
- CORS headers must be properly configured on the backend

## Troubleshooting

### Widget Not Appearing
- Check browser console for JavaScript errors
- Verify the script URL is accessible
- Ensure no CSS conflicts with z-index

### Chat Not Working
- Verify the API endpoint is accessible
- Check CORS configuration on the backend
- Review network tab in browser dev tools

### Styling Issues
- Check for CSS conflicts
- Verify custom properties are being applied
- Test in different browsers

## Support

For issues and feature requests:
- Check the GitHub repository
- Review the API documentation
- Contact the Heady team

## License

This widget is part of the Heady ecosystem and follows the same licensing terms as other Heady components.
