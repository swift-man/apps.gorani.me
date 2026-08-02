import assert from 'node:assert/strict';

import { assertIsoDate } from '../src/utils/iso-date.mjs';

const validDates = ['2000-01-01', '2024-02-29', '2026-08-03'];
const invalidDates = ['2026-8-3', '2026-02-29', '2026-04-31', '2026-13-01', '', null, undefined];

for (const value of validDates) {
  assert.equal(assertIsoDate(value, 'test.date'), value);
}

for (const value of invalidDates) {
  assert.throws(
    () => assertIsoDate(value, 'test.date'),
    (error) => error instanceof TypeError && error.message.startsWith('test.date must be a valid ISO calendar date')
  );
}

console.log(`Data validation regression passed: ${validDates.length} valid and ${invalidDates.length} invalid dates.`);
