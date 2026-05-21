import test from 'node:test';
import assert from 'node:assert/strict';

import { buildPublicTestDefinition } from '../lib/api/public-test-definition.ts';

test('buildPublicTestDefinition returns only active tests with variants', () => {
  const definition = buildPublicTestDefinition(
    {
      id: 'test-1',
      name: 'Jiyu headline',
      test_key: 'jiyu_headline_v1',
      status: 'active',
      created_at: '2026-05-16T00:00:00.000Z',
    },
    [
      {
        id: 'variant-a',
        test_id: 'test-1',
        variant_key: 'A',
        headline: 'Renewal & Rejuvenation Toner Pads',
        is_control: true,
        created_at: '2026-05-16T00:00:00.000Z',
      },
      {
        id: 'variant-b',
        test_id: 'test-1',
        variant_key: 'B',
        headline: 'Erase Dark Spots With Every Swipe',
        subheadline: 'A brighter glow starts here.',
        is_control: false,
        created_at: '2026-05-16T00:00:00.000Z',
      },
    ],
  );

  assert.deepEqual(definition, {
    test_key: 'jiyu_headline_v1',
    status: 'active',
    variants: [
      {
        variant_key: 'A',
        headline: 'Renewal & Rejuvenation Toner Pads',
        is_control: true,
      },
      {
        variant_key: 'B',
        headline: 'Erase Dark Spots With Every Swipe',
        subheadline: 'A brighter glow starts here.',
        is_control: false,
      },
    ],
  });
});

test('buildPublicTestDefinition returns null for inactive or empty tests', () => {
  assert.equal(
    buildPublicTestDefinition(
      {
        id: 'test-2',
        name: 'Draft test',
        test_key: 'draft_key',
        status: 'draft',
        created_at: '2026-05-16T00:00:00.000Z',
      },
      [
        {
          id: 'variant-a',
          test_id: 'test-2',
          variant_key: 'A',
          headline: 'Draft headline',
          is_control: true,
          created_at: '2026-05-16T00:00:00.000Z',
        },
      ],
    ),
    null,
  );

  assert.equal(
    buildPublicTestDefinition(
      {
        id: 'test-3',
        name: 'No variants',
        test_key: 'empty_key',
        status: 'active',
        created_at: '2026-05-16T00:00:00.000Z',
      },
      [],
    ),
    null,
  );
});
