/**
 * Generates a unique booking reference in format: SBP-YYYY-XXXX
 * Where XXXX is a random alphanumeric string
 * Example: SBP-2026-A3K9
 */
export const generateBookingReference = (): string => {
  const year = new Date().getFullYear();
  const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestamp = Date.now().toString().slice(-3);
  return `SBP-${year}-${randomString}${timestamp}`.slice(0, 15);
};
