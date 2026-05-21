import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveDashboardSelection } from '../lib/dashboard/dashboard-state.ts';

test('resolveDashboardSelection returns the connected dataset when nothing is selected', () => {
  const state = resolveDashboardSelection({
    selectedTestName: '',
    connectedDataset: {
      test: {
        id: 'jiyu-test',
        name: 'JiYu Headline Test V1',
        description: 'JiYu connected test',
        status: 'active',
        created_at: '2026-05-21T00:00:00.000Z',
      },
      kpis: {
        total_visitors: 20,
        total_clicks: 5,
        total_purchases: 1,
        conversion_rate: 25,
        purchase_conversion_rate: 5,
        leader_variant: 'A',
        leader_metric: 'ctr',
        confidence_level: 88.5,
      },
      variants: [{ variant_key: 'A', headline: 'Headline', is_leader: true, is_control: true, visitors: 20, clicks: 5, ctr: 25, conversions: 5, conversion_rate: 25, purchases: 1, purchase_conversion_rate: 5, lift: 0 }],
      events: [{ id: 'event-1', title: 'CTA click on Variant A', description: 'JiYu Headline Test V1 recorded cta click on /jiyu.', time_ago: '1 minute ago', type: 'success' }],
      chartData: [{ date: 'May 22', A: 25 }],
    },
    datasetsByName: {},
  });

  assert.equal(state.title, 'JiYu Headline Test V1');
  assert.equal(state.activeTestConnected, true);
  assert.equal(state.kpis.total_visitors, 20);
});

test('resolveDashboardSelection returns the selected real dataset when the name exists', () => {
  const state = resolveDashboardSelection({
    selectedTestName: 'Snooze Brew Headline Test V1',
    connectedDataset: {
      test: {
        id: 'jiyu-test',
        name: 'JiYu Headline Test V1',
        description: 'JiYu connected test',
        status: 'active',
        created_at: '2026-05-21T00:00:00.000Z',
      },
      kpis: {
        total_visitors: 20,
        total_clicks: 5,
        total_purchases: 1,
        conversion_rate: 25,
        purchase_conversion_rate: 5,
        leader_variant: 'A',
        leader_metric: 'ctr',
        confidence_level: 88.5,
      },
      variants: [],
      events: [],
      chartData: [],
    },
    datasetsByName: {
      'Snooze Brew Headline Test V1': {
        test: {
          id: 'snooze-test',
          name: 'Snooze Brew Headline Test V1',
          description: 'Snooze Brew connected test',
          status: 'active',
          created_at: '2026-05-20T00:00:00.000Z',
        },
        kpis: {
          total_visitors: 42,
          total_clicks: 9,
          total_purchases: 2,
          conversion_rate: 21.4,
          purchase_conversion_rate: 4.8,
          leader_variant: 'B',
          leader_metric: 'ctr',
          confidence_level: 91.2,
        },
        variants: [{ variant_key: 'B', headline: 'Sleep better', is_leader: true, is_control: false, visitors: 42, clicks: 9, ctr: 21.4, conversions: 9, conversion_rate: 21.4, purchases: 2, purchase_conversion_rate: 4.8, lift: 12.1 }],
        events: [{ id: 'event-2', title: 'Page view on Variant B', description: 'Snooze Brew Headline Test V1 recorded page view on /sleep.', time_ago: '2 minutes ago', type: 'info' }],
        chartData: [{ date: 'May 22', B: 21.4 }],
      },
    },
  });

  assert.equal(state.title, 'Snooze Brew Headline Test V1');
  assert.equal(state.activeTestConnected, true);
  assert.equal(state.kpis.total_visitors, 42);
  assert.equal(state.events[0].title, 'Page view on Variant B');
});

test('resolveDashboardSelection falls back to the disconnected placeholder when the name is missing', () => {
  const state = resolveDashboardSelection({
    selectedTestName: 'Unknown Test',
    connectedDataset: {
      test: null,
      kpis: {
        total_visitors: 0,
        total_clicks: 0,
        total_purchases: 0,
        conversion_rate: 0,
        purchase_conversion_rate: 0,
        leader_variant: '—',
        leader_metric: 'ctr',
        confidence_level: 0,
      },
      variants: [],
      events: [],
      chartData: [],
    },
    datasetsByName: {},
  });

  assert.equal(state.title, 'Unknown Test');
  assert.equal(state.activeTestConnected, false);
  assert.equal(state.kpis.total_visitors, 0);
});
