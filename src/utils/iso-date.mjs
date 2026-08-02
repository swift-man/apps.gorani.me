const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Ensures a value is a real calendar date written as YYYY-MM-DD.
 *
 * @param {unknown} value
 * @param {string} [fieldName]
 * @returns {string}
 */
export function assertIsoDate(value, fieldName = 'date') {
  const timestamp = typeof value === 'string' ? Date.parse(`${value}T00:00:00Z`) : Number.NaN;
  const normalized = Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : undefined;

  if (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value) || normalized !== value) {
    throw new TypeError(
      `${fieldName} must be a valid ISO calendar date (YYYY-MM-DD), received ${JSON.stringify(value)}`
    );
  }

  return value;
}
