import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isSecretRequiredForTrackEvent,
  parseAllowedOrigins,
} from '../lib/api/tracking-policy.ts';

test('parseAllowedOrigins splits comma-separated origin lists', () => {
  assert.deepEqual(
    parseAllowedOrigins('https://one.example, https://two.example  ,https://three.example'),
    ['https://one.example', 'https://two.example', 'https://three.example'],
  );
});

test('page view and cta click do not require a shared secret', () => {
  assert.equal(isSecretRequiredForTrackEvent('page_view'), false);
  assert.equal(isSecretRequiredForTrackEvent('cta_click'), false);
});

test('purchase tracking remains protected by the shared secret', () => {
  assert.equal(isSecretRequiredForTrackEvent('purchase'), true);
  assert.equal(isSecretRequiredForTrackEvent('unknown'), true);
});
