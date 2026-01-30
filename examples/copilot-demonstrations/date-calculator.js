/**
 * Date Calculator - GitHub Copilot Inline Suggestions Demo
 * 
 * This file demonstrates how GitHub Copilot provides inline suggestions
 * when you type function signatures.
 * 
 * To try this yourself:
 * 1. Open this file in an editor with GitHub Copilot enabled
 * 2. Type a function signature and press Enter
 * 3. GitHub Copilot will suggest the implementation in grayed text
 * 4. Press Tab to accept the suggestion
 */

/**
 * Calculate the number of days between two dates
 * @param {string|Date} begin - Start date
 * @param {string|Date} end - End date
 * @returns {number} Number of days between the dates
 */
function calculateDaysBetweenDates(begin, end) {
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  const firstDate = new Date(begin);
  const secondDate = new Date(end);
  
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

/**
 * Example usage of calculateDaysBetweenDates
 */
function demonstrateDateCalculation() {
  const start = '2024-01-01';
  const end = '2024-12-31';
  const days = calculateDaysBetweenDates(start, end);
  
  console.log(`Days between ${start} and ${end}: ${days}`);
  
  // Additional examples
  console.log('Days in January 2024:', calculateDaysBetweenDates('2024-01-01', '2024-01-31'));
  console.log('Days until next year:', calculateDaysBetweenDates(new Date(), '2025-01-01'));
}

/**
 * Calculate business days between two dates (excluding weekends)
 * @param {string|Date} begin - Start date
 * @param {string|Date} end - End date
 * @returns {number} Number of business days
 */
function calculateBusinessDays(begin, end) {
  const startDate = new Date(begin);
  const endDate = new Date(end);
  let count = 0;
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return count;
}

/**
 * Format date difference in human-readable format
 * @param {string|Date} begin - Start date
 * @param {string|Date} end - End date
 * @returns {string} Human-readable date difference
 */
function formatDateDifference(begin, end) {
  const days = calculateDaysBetweenDates(begin, end);
  
  if (days === 0) {
    return 'Same day';
  } else if (days === 1) {
    return '1 day';
  } else if (days < 7) {
    return `${days} days`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    return `${weeks} week${weeks > 1 ? 's' : ''}${remainingDays > 0 ? ` and ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : ''}`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `about ${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(days / 365);
    return `about ${years} year${years > 1 ? 's' : ''}`;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateDaysBetweenDates,
    calculateBusinessDays,
    formatDateDifference,
    demonstrateDateCalculation
  };
}
