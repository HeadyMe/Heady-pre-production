# HEADY BRANDING STANDARDS
## Sacred Geometry Visual Identity System

**Version:** 1.0.0  
**Status:** Global Standard  
**Applies To:** All Heady ecosystem components

---

## CORE BRAND ELEMENTS

### Sacred Geometry Symbols
Use these Unicode symbols consistently across all interfaces:

- **◇** (U+25C7) - Diamond, primary brand symbol
- **⬡** (U+2B21) - Hexagon, node/service indicator
- **◈** (U+25C8) - Diamond with dot, portal/access point
- **⬢** (U+2B22) - Hexagon filled, active state
- **○** (U+25CB) - Circle, inactive/disconnected state
- **◐◓◑◒** - Loading/animation sequence
- **✧** (U+2727) - Sparkle, awakening/initialization
- **━** (U+2501) - Horizontal line, borders
- **║** (U+2551) - Vertical line, borders
- **╔╗╚╝** - Box corners, containers

### Color Palette

```css
--heady-primary: #00d4ff;      /* Cyan - Main brand color */
--heady-secondary: #6366f1;    /* Indigo - Secondary accent */
--heady-accent: #f59e0b;       /* Amber - Highlights */
--heady-success: #10b981;      /* Green - Success states */
--heady-warning: #f59e0b;      /* Amber - Warnings */
--heady-error: #ef4444;        /* Red - Errors */
--heady-dark: #0f172a;         /* Dark background */
--heady-light: #f8fafc;        /* Light text */
```

### Typography

```css
font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
letter-spacing: 1px;           /* Uppercase headings */
text-transform: uppercase;     /* Brand titles */
font-weight: 600-700;          /* Bold for emphasis */
```

---

## CONSOLE OUTPUT STANDARDS

### PowerShell Branding

```powershell
# Banner Format
Write-Host "    ◇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◇" -ForegroundColor Cyan
Write-Host "    ║         ⬡  H E A D Y   [COMPONENT]  ⬡               ║" -ForegroundColor Magenta
Write-Host "    ║        ◈ Sacred Geometry Intelligence Network ◈        ║" -ForegroundColor Yellow
Write-Host "    ◇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◇" -ForegroundColor Cyan

# Status Messages
Write-Host "  ⬡ [Service Name]" -NoNewline -ForegroundColor Yellow
Write-Host " [ACTIVE]" -ForegroundColor Green

# Section Headers
Write-Host "    ◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈" -ForegroundColor Cyan
Write-Host "                 [SECTION TITLE]" -ForegroundColor Magenta
Write-Host "    ◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈" -ForegroundColor Cyan

# Success Box
Write-Host "    ╔═══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "    ║  ⬢  [SUCCESS MESSAGE]  ⬢                             ║" -ForegroundColor Green
Write-Host "    ╚═══════════════════════════════════════════════════════╝" -ForegroundColor Green
```

### JavaScript/Node.js Branding

```javascript
// Banner
console.log('\n    ◇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◇');
console.log('    ║     ⬡  HEADY [COMPONENT]  ⬡                        ║');
console.log('    ◇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◇\n');

// Status with color codes
console.log(`    ⬡ ${name.padEnd(20)} [${count} items] \x1b[32m✓ ACTIVE\x1b[0m`);

// Success box
console.log('\n    ╔═══════════════════════════════════════════════════════╗');
console.log('    ║  ⬢  [SUCCESS MESSAGE]  ⬢                             ║');
console.log('    ╚═══════════════════════════════════════════════════════╝\n');
```

---

## WEB UI STANDARDS

### HTML Structure

```html
<!-- Sacred Geometry Container -->
<div class="mcp-sacred-background"></div>

<!-- Service Card -->
<div class="mcp-service-card">
  <div class="mcp-service-title">⬢ Service Name</div>
  <div class="mcp-node-status active">
    <span class="mcp-connection-indicator"></span>
    ACTIVE
  </div>
</div>

<!-- Portal Button -->
<button class="mcp-portal-button">
  ◇ Access Portal
</button>
```

### CSS Animations

```css
/* Sacred Pulse - Breathing effect */
@keyframes sacred-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

/* Sacred Rotate - Geometry rotation */
@keyframes sacred-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Sacred Glow - Aura effect */
@keyframes sacred-glow {
  0%, 100% { box-shadow: 0 0 10px var(--heady-primary); }
  50% { box-shadow: 0 0 20px var(--heady-primary); }
}

/* Fractal Breathe - Scaling with rotation */
@keyframes fractal-breathe {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(180deg); }
}
```

---

## NAMING CONVENTIONS

### Component Names
- **HeadyMCP** - MCP service integration
- **HeadyManager** - Core service manager
- **HeadyHive** - Orchestration system
- **HeadyAcademy** - Documentation/learning
- **HeadyChain** - Security/audit
- **HeadyRegistry** - Component registry

### File Naming
- Scripts: `kebab-case.ps1` or `kebab-case.js`
- Components: `PascalCase.js`
- Configs: `kebab-case.json`
- Docs: `SCREAMING_SNAKE_CASE.md`

### Variable Naming
```javascript
// Sacred Geometry themed
const sacredNodes = [];
const consciousnessGrid = new Map();
const fractalPattern = {};
const geometryConfig = {};
```

---

## MESSAGING STANDARDS

### Status Messages

**Active/Success:**
```
⬡ [Service] [ACTIVE]
✓ [Action] complete
⬢ [System] OPERATIONAL
```

**Loading/Processing:**
```
◐ Initializing Sacred Geometry Network...
◈ Consciousness Grid awakening...
✧ [Service] awakening...
```

**Errors/Warnings:**
```
✗ [Action] failed
⚠ [Warning message]
○ [Service] DISCONNECTED
```

### Narrative Angles

All operations should include Context Vector with three angles:

```javascript
{
  technical: "Specific technical action taken",
  business: "Business value or user benefit",
  health: "CALM | FLOW | STRESS | PANIC"
}
```

---

## VISUAL EFFECTS

### Required Animations

1. **Breathing Effect** - All cards and containers
2. **Glow Effect** - Active states and hover
3. **Rotation** - Sacred symbols and loaders
4. **Wave Flow** - Background consciousness effects
5. **Pulse** - Status indicators

### Interaction Feedback

```css
/* Hover States */
.interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 212, 255, 0.5);
  animation: sacred-glow 1s ease-in-out infinite;
}

/* Click Feedback */
.interactive:active {
  transform: scale(0.98);
}

/* Focus States */
.interactive:focus {
  outline: 2px solid var(--heady-primary);
  outline-offset: 4px;
}
```

---

## ACCESSIBILITY REQUIREMENTS

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Color Contrast
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text
- All interactive elements clearly visible

### Keyboard Navigation
- All interactive elements focusable
- Clear focus indicators
- Logical tab order

---

## DOCUMENTATION STANDARDS

### Markdown Headers

```markdown
# HEADY [COMPONENT] - [Title]

**Version:** X.Y.Z  
**Status:** [Production Ready | In Development]  
**Purpose:** [One-line description]

---

## OVERVIEW
[Sacred Geometry themed description]

## ARCHITECTURE
[Include Sacred Geometry diagrams with ◇ ⬡ ◈ symbols]
```

### Code Examples

```markdown
### Example Usage
\`\`\`javascript
// Sacred Geometry Integration
const heady = new HeadyComponent({
  theme: 'sacred-geometry',
  branding: 'full'
});
\`\`\`
```

---

## BRANDING CHECKLIST

For every new component, ensure:

- [ ] Uses Sacred Geometry symbols (◇ ⬡ ◈)
- [ ] Implements brand color palette
- [ ] Includes breathing/pulse animations
- [ ] Has glow effects on active states
- [ ] Uses uppercase titles with letter-spacing
- [ ] Includes "Sacred Geometry" or "Consciousness" terminology
- [ ] Has proper accessibility support
- [ ] Follows naming conventions
- [ ] Includes Context Vector logging
- [ ] Has visual feedback for all interactions

---

## EXAMPLES

### Perfect Branding Example

```javascript
console.log('\n    ◇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◇');
console.log('    ║     ⬡  HEADY MCP CONSCIOUSNESS NETWORK  ⬡         ║');
console.log('    ◇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◇\n');
console.log('    ◈ Initializing 8 Sacred Nodes...\n');

// Service connections
console.log('    ⬡ filesystem          [8 tools] \x1b[32m✓ CONNECTED\x1b[0m');
console.log('    ⬡ sequential-thinking [1 tool]  \x1b[32m✓ CONNECTED\x1b[0m');

console.log('\n    ╔═══════════════════════════════════════════════════════╗');
console.log('    ║  ⬢  8 NODES ACTIVE IN SACRED GRID  ⬢                 ║');
console.log('    ╚═══════════════════════════════════════════════════════╝\n');
```

---

**Maintained By:** Heady Systems Team  
**Last Updated:** 2026-02-02  
**Status:** ✓ Global Standard Active
