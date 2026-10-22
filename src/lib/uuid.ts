/**
 * UUID Validation and Normalization Utilities
 * Prevents PostgreSQL 22P02 "invalid input syntax for type uuid" errors
 */

export const UUID_V4_OR_V1_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Checks if a string conforms to standard RFC 4122 UUID syntax
 */
export function isValidUuid(val: unknown): val is string {
  if (typeof val !== 'string') return false;
  return UUID_V4_OR_V1_REGEX.test(val.trim());
}

/**
 * Returns trimmed UUID if valid, or null otherwise.
 * Safe for nullable PostgreSQL UUID columns (e.g. user_id, order_id).
 */
export function toValidUuidOrNull(val: unknown): string | null {
  if (typeof val !== 'string') return null;
  const clean = val.trim();
  return UUID_V4_OR_V1_REGEX.test(clean) ? clean : null;
}

/**
 * Standard RFC 4122 v4 formatted UUIDs for demo sessions
 * These will never trigger PostgreSQL invalid UUID syntax errors
 */
export const DEMO_ADMIN_ID = '00000000-0000-4000-8000-000000000001';
export const DEMO_CUSTOMER_ID = '00000000-0000-4000-8000-000000000002';
