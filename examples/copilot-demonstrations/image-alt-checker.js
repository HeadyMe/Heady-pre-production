/**
 * Image Alt Text Checker - GitHub Copilot Comment-Driven Development Demo
 * 
 * This file demonstrates how GitHub Copilot can generate code from natural
 * language comments.
 * 
 * To try this yourself:
 * 1. Open this file in an editor with GitHub Copilot enabled
 * 2. Type a descriptive comment explaining what you want
 * 3. GitHub Copilot will suggest the implementation
 * 4. Press Tab to accept the suggestion
 */

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

// find all images with missing or empty alt attributes
function findImagesWithoutAlt() {
  const images = document.querySelectorAll('img');
  const imagesWithoutAlt = [];
  
  images.forEach(img => {
    if (!img.alt || img.alt.trim() === '') {
      imagesWithoutAlt.push({
        element: img,
        src: img.src,
        location: img.parentElement ? img.parentElement.tagName : 'unknown'
      });
    }
  });
  
  return imagesWithoutAlt;
}

// generate a report of accessibility issues with images
function generateAccessibilityReport() {
  const imagesWithoutAlt = findImagesWithoutAlt();
  const totalImages = document.querySelectorAll('img').length;
  
  const report = {
    timestamp: new Date().toISOString(),
    totalImages: totalImages,
    imagesWithoutAlt: imagesWithoutAlt.length,
    percentageCompliant: totalImages > 0 ? ((totalImages - imagesWithoutAlt.length) / totalImages * 100).toFixed(2) : 100,
    issues: imagesWithoutAlt.map((img, index) => ({
      id: index + 1,
      src: img.src,
      location: img.location,
      recommendation: 'Add descriptive alt text for accessibility'
    }))
  };
  
  return report;
}

// add event listeners to log when images load without alt text
function monitorImageAccessibility() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'IMG' && (!node.alt || node.alt.trim() === '')) {
          console.warn('Image added without alt text:', node.src);
          node.style.border = '3px solid red';
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
}

// create a visual overlay showing accessibility issues
function createAccessibilityOverlay() {
  const imagesWithoutAlt = findImagesWithoutAlt();
  
  if (imagesWithoutAlt.length === 0) {
    console.log('✅ All images have alt text!');
    return;
  }
  
  // Create overlay div
  const overlay = document.createElement('div');
  overlay.id = 'accessibility-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(255, 0, 0, 0.9);
    color: white;
    padding: 20px;
    border-radius: 8px;
    z-index: 10000;
    max-width: 400px;
    font-family: Arial, sans-serif;
  `;
  
  overlay.innerHTML = `
    <h3 style="margin-top: 0;">⚠️ Accessibility Issues</h3>
    <p><strong>${imagesWithoutAlt.length}</strong> image${imagesWithoutAlt.length > 1 ? 's' : ''} without alt text</p>
    <button id="highlight-issues" style="
      background: white;
      color: red;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    ">Highlight Issues</button>
    <button id="close-overlay" style="
      background: transparent;
      color: white;
      border: 1px solid white;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 10px;
    ">Close</button>
  `;
  
  document.body.appendChild(overlay);
  
  // Add event listeners
  document.getElementById('highlight-issues').addEventListener('click', highlightImagesWithoutAlt);
  document.getElementById('close-overlay').addEventListener('click', () => overlay.remove());
}

// fix accessibility issues by adding default alt text
function fixAccessibilityIssues() {
  const imagesWithoutAlt = findImagesWithoutAlt();
  let fixed = 0;
  
  imagesWithoutAlt.forEach(({ element }) => {
    // Extract filename from src as a basic alt text
    const filename = element.src.split('/').pop().split('.')[0];
    const defaultAlt = filename.replace(/[-_]/g, ' ');
    
    element.alt = defaultAlt;
    element.style.border = '3px solid green';
    fixed++;
  });
  
  console.log(`✅ Fixed ${fixed} image${fixed > 1 ? 's' : ''} with default alt text`);
  return fixed;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    highlightImagesWithoutAlt,
    findImagesWithoutAlt,
    generateAccessibilityReport,
    monitorImageAccessibility,
    createAccessibilityOverlay,
    fixAccessibilityIssues
  };
}

// Browser-friendly exports
if (typeof window !== 'undefined') {
  window.ImageAltChecker = {
    highlightImagesWithoutAlt,
    findImagesWithoutAlt,
    generateAccessibilityReport,
    monitorImageAccessibility,
    createAccessibilityOverlay,
    fixAccessibilityIssues
  };
}
