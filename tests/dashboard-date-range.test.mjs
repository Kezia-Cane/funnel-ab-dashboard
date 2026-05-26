import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildUtcDateRange,
  getDefaultDashboardDate,
  isValidDashboardDate,
} from '../lib/dashboard/date-range.ts';

test('buildUtcDateRange returns a full UTC day for a dashboard date', () => {
  const range = buildUtcDateRange('2026-05-27');

  assert.deepEqual(range, {
    start: '2026-05-27T00:00:00.000Z',
    end: '2026-05-28T00:00:00.000Z',
  });
});

test('buildUtcDateRange handles month boundaries', () => {
  const range = buildUtcDateRange('2026-05-31');

  assert.equal(range.start, '2026-05-31T00:00:00.000Z');
  assert.equal(range.end, '2026-06-01T00:00:00.000Z');
});

test('isValidDashboardDate only accepts real yyyy-mm-dd dates', () => {
  assert.equal(isValidDashboardDate('2026-05-27'), true);
  assert.equal(isValidDashboardDate('2026-02-30'), false);
  assert.equal(isValidDashboardDate('05/27/2026'), false);
});

test('getDefaultDashboardDate formats today as yyyy-mm-dd in UTC', () => {
  assert.equal(getDefaultDashboardDate(new Date('2026-05-27T15:45:00.000Z')), '2026-05-27');
});

test('getDefaultDashboardDate can format today in the dashboard timezone', () => {
  assert.equal(getDefaultDashboardDate(new Date('2026-05-26T18:00:00.000Z'), 'Asia/Singapore'), '2026-05-27');
});
