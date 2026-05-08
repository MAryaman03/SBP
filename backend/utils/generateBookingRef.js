const crypto = require('crypto');

/**
 * Generates a unique, collision-resistant booking reference
 * Format: SBP-YYYY-XXXXX (e.g., SBP-2026-12A9B)
 * Uses secure random bytes for high uniqueness
 */
function generateUniqueBookingRef() {
  const year = new Date().getFullYear();
  // 3 bytes gives us 6 hex characters (e.g., F4A2B1) which provides ~16.7M combinations per year
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase(); 
  return `SBP-${year}-${randomHex}`;
}

module.exports = generateUniqueBookingRef;
