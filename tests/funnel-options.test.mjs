import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSelectableFunnelNames } from '../lib/dashboard/funnel-options.js';

test('buildSelectableFunnelNames returns unique ab_tests names excluding the connected test', () => {
  const funnelNames = buildSelectableFunnelNames(
    [
      {
        id: 'connected-test',
        name: 'LullaBites Headline Test V1',
        test_key: 'lullabites_headline_v1',
        status: 'active',
        created_at: '2026-05-16T00:00:00.000Z',
      },
      {
        id: 'snooze-test',
        name: 'Snooze Brew Headline Test V1',
        test_key: 'snooze_brew_headline_v1',
        status: 'active',
        created_at: '2026-05-15T00:00:00.000Z',
      },
      {
        id: 'jiyu-test',
        name: 'JiYu Headline Test V1',
        test_key: 'jiyu_headline_v1',
        status: 'active',
        created_at: '2026-05-14T00:00:00.000Z',
      },
      {
        id: 'duplicate-snooze',
        name: 'Snooze Brew Headline Test V1',
        test_key: 'snooze_brew_headline_v2',
        status: 'draft',
        created_at: '2026-05-13T00:00:00.000Z',
      },
    ],
    'LullaBites Headline Test V1',
  );

  assert.deepEqual(funnelNames, [
    'Snooze Brew Headline Test V1',
    'JiYu Headline Test V1',
  ]);
});

test('buildSelectableFunnelNames keeps names when there is no connected test', () => {
  const funnelNames = buildSelectableFunnelNames([
    {
      id: 'snooze-test',
      name: 'Snooze Brew Headline Test V1',
      test_key: 'snooze_brew_headline_v1',
      status: 'active',
      created_at: '2026-05-15T00:00:00.000Z',
    },
  ]);

  assert.deepEqual(funnelNames, ['Snooze Brew Headline Test V1']);
});
