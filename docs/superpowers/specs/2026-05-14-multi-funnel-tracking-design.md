# Multi-Funnel Tracking Workflow Design

**Date:** 2026-05-14
**Project:** `funnel-ab-dashboard`
**Status:** Approved for spec drafting, pending user review

## Goal

Extend the current A/B tracking dashboard so three Vercel-hosted funnel projects and their GoHighLevel checkout flows can all send tracking into the same Next.js + Supabase backend without breaking the current single-test funnel setup.

## Current State Summary

The repo currently centers on a single A/B test model:

- `ab_tests` stores test metadata keyed by `test_key`
- `ab_variants` stores headline variants per test
- `ab_events` stores `page_view`, `cta_click`, and `purchase`
- Next.js API routes receive tracking requests and write events through the Supabase service role client
- Dashboard pages aggregate analytics from `ab_tests`, `ab_variants`, and `ab_events`

The current setup is useful for one funnel experiment, but it is limited in four ways:

1. It assumes a single funnel context rather than multiple funnel projects.
2. It treats A/B testing as the primary identity instead of funnel/project identity.
3. It has no persistent session continuity from Vercel pages into GoHighLevel checkout pages.
4. It does not yet offer a reusable frontend tracker for multiple Vercel projects.

## New Workflow Requirements

The new workflow must support:

- Multiple funnel projects sending data into the same dashboard backend
- Vercel-hosted content and landing pages tracking page views and CTA clicks
- GoHighLevel checkout, embedded forms, and thank-you pages tracking checkout and conversion steps
- Persistent `session_id` across Vercel and GHL pages
- Variant assignment on Vercel as the source of truth
- Product selection captured as both a dedicated event and attached metadata
- Dashboard filtering by funnel/project

## Recommended Architecture

### Primary Analytics Model

Use a hybrid model:

- `funnel_project` is the primary analytics context
- `experiment_key` / `test_key` remains optional for A/B testing
- the existing `ab_tests`, `ab_variants`, and `ab_events` tables remain the source of truth

This preserves the existing code while allowing non-test funnel traffic and multi-funnel reporting.

### Source of Truth

Vercel frontend pages are the source of truth for:

- `session_id`
- `variant`
- `funnel_project_key`
- `product_selected`

GoHighLevel pages should not generate a new identity unless all inbound identity data is missing. Their job is to reuse the Vercel-generated identity and continue the event stream.

## Data Model Design

### Existing Tables to Keep

- `ab_tests`
- `ab_variants`
- `ab_events`
- `ab_sessions`

### Additive Changes

#### `ab_tests`

Add:

- `funnel_project_key TEXT`
- optional `is_active BOOLEAN` only if the current status model proves insufficient

Purpose:

- lets the same dashboard relate multiple tests to a funnel project
- keeps current test-centric analytics intact

#### `ab_events`

Expand the event model so one table can represent both frontend and checkout flow behavior.

Add or promote to first-class columns:

- `funnel_project_key TEXT`
- `session_id TEXT`
- `page_type TEXT`
- `source_platform TEXT`
- `product_selected TEXT`

Keep flexible fields in `metadata` for:

- raw campaign params
- extra product detail
- form IDs
- checkout IDs
- order IDs
- customer email where appropriate

Expand `event_type` to support:

- `page_view`
- `cta_click`
- `product_selected`
- `checkout_visit`
- `form_submit`
- `purchase`
- `thank_you_page_view`

This preserves existing events and makes the funnel flow analyzable from first visit through conversion.

#### `ab_sessions`

Continue using `ab_sessions` as the session bridge table instead of introducing a new sessions table.

Extend it to better support multi-funnel tracking if needed:

- `funnel_project_key TEXT`
- `product_selected TEXT`
- `landing_page_path TEXT`
- `last_page_path TEXT`

Purpose:

- store first-seen session data
- remember assigned variant and test linkage
- support continuity from Vercel to GHL

## Event Semantics

### Vercel Events

Vercel pages should track:

- `page_view`
- `cta_click`
- `product_selected`

Each event should include:

- `session_id`
- `funnel_project_key`
- `page_type`
- `page_url`
- `page_path`
- `source_platform = 'vercel'`
- `variant` if active
- `test_key` if active
- `product_selected` when relevant

### GHL Events

GHL pages should track:

- `checkout_visit`
- `form_submit` where a reliable hook exists
- `purchase` where a reliable hook exists
- `thank_you_page_view`

Each event should include:

- `session_id`
- `funnel_project_key`
- `page_type`
- `source_platform = 'ghl'`
- `variant` if available
- `test_key` if available
- `product_selected` if available

If GHL cannot reliably fire `purchase`, then `thank_you_page_view` becomes the fallback conversion indicator. The system should support both without assuming they are always equivalent.

## Cross-Platform Identity Flow

### Session Lifecycle

1. A visitor lands on a Vercel page.
2. The tracker reads or creates a persistent `session_id` in `localStorage`.
3. If the page participates in an experiment, the tracker reads or assigns a `variant`.
4. If the user selects a product, that choice is stored locally and attached to tracking events.
5. When the user clicks a CTA to a GHL checkout URL, the tracker appends URL parameters:
   - `sid`
   - `fp`
   - `var`
   - `tk`
   - `pt`
   - `ps`
6. GHL pages read those parameters, persist them to `localStorage`, and continue sending events to the same backend.

### URL Parameter Contract

Recommended short parameter names:

- `sid` = session ID
- `fp` = funnel project key
- `var` = variant key
- `tk` = test key
- `pt` = page type
- `ps` = product selected

These should be appended by Vercel CTA links and read by GHL helper scripts.

## Frontend Tracking Design

### Reusable Tracker Helper

Create a reusable browser-safe tracking helper for Vercel projects.

Responsibilities:

- initialize session identity
- manage variant assignment persistence
- manage product selection persistence
- send page view and CTA events
- build GHL checkout URLs with tracking parameters
- expose a small configuration surface per funnel project

Expected config shape:

- `funnelProjectKey`
- `pageType`
- `trackingEndpoint`
- `activeTestKey` optional
- `defaultVariant` optional
- `ctaSelector` or explicit click handler wiring

This should be easy to copy into the three Vercel funnel repos without rewriting business logic.

### GHL Snippet Helper

Provide a lightweight script/snippet for GHL pages that:

- reads session, funnel, variant, and product from URL params
- persists them to `localStorage`
- tracks checkout or thank-you events
- supports optional hooks for form submission and purchase calls

This script should remain simple enough for manual insertion into GHL custom code blocks.

## API Design

### Keep Existing Routes

Keep:

- `/api/ab-track`
- `/api/ab-purchase`

Do not break current callers.

### Recommended API Evolution

Extend validation so the main tracking route can accept:

- new event types
- `funnel_project_key`
- `session_id`
- `page_type`
- `source_platform`
- `product_selected`

The API should resolve test and variant references like today when `test_key` and `variant` are supplied.

For non-test funnel traffic:

- allow events to be recorded without a live A/B test only if the schema and route logic can safely support optional test linkage
- otherwise, create a lightweight fallback “default test” per funnel project

The safer initial implementation is to keep test linkage required and introduce one baseline test record per funnel project. That minimizes disruption to existing query logic while still enabling the new workflow.

## Dashboard Design

### Primary UI Improvement

Add funnel/project filtering across the dashboard.

Recommended controls:

- top-level funnel/project dropdown
- test dropdown scoped to the selected funnel

### Dashboard Views

Update analytics views to support:

- all funnels combined
- one funnel filtered
- one test within a funnel

At minimum, the following screens should be updated:

- dashboard overview
- tests list
- test detail
- event logs
- settings / integration instructions

### Metrics Behavior

Aggregate metrics should behave like this:

- funnel-level metrics include all events for the selected `funnel_project_key`
- test-level metrics continue to use variant/test logic where available
- event logs show `funnel_project_key`, `page_type`, and `source_platform`

## Supabase Notes

The connected Supabase account could not be inspected directly from the current tool session, so this design is based on the repo schema and current code behavior.

Implementation should include:

- a migration for additive schema changes
- preservation of current RLS posture
- index additions for `funnel_project_key`, `session_id`, and any new high-cardinality filter columns
- verification queries after migration

Because Supabase can require explicit Data API exposure behavior for new tables or views, avoid introducing unnecessary new public tables. Prefer extending existing tables first.

## Error Handling and Edge Cases

### Missing Variant

If no experiment is active:

- track the event with no variant
- keep `funnel_project_key` and `session_id`
- avoid forcing fake variant assignment

### Missing GHL Params

If a user lands directly on GHL:

- attempt to recover identity from `localStorage`
- if none exists, create a new `session_id`
- track the event with missing variant/test fields allowed where possible

### Duplicate Conversion Signals

If both `purchase` and `thank_you_page_view` are recorded:

- keep both events
- treat them as separate event types
- do not deduplicate them during event ingestion; only add reporting-side deduplication if real data shows it is necessary

## Testing Strategy

Implementation should verify:

- existing `page_view`, `cta_click`, and `purchase` still work
- Vercel tracker creates and reuses `session_id`
- variant persists across page navigation
- CTA links append tracking params correctly
- GHL pages can continue the same session
- funnel/project filters work in dashboard queries
- multi-funnel events do not contaminate one another

## Rollout Strategy

Recommended rollout order:

1. Add additive schema fields and expanded event support.
2. Update API validation and insertion logic.
3. Build reusable Vercel tracking helper.
4. Build GHL snippet helper.
5. Update dashboard filters and event views.
6. Add setup documentation for the three funnel projects and GHL pages.

This sequencing keeps the current system operational while the new workflow is layered in gradually.

## File Impact Forecast

Likely files to modify:

- `types/index.ts`
- `lib/validation.ts`
- `lib/supabase/queries.ts`
- `app/api/ab-track/route.ts`
- `app/api/ab-purchase/route.ts`
- `app/dashboard/page.tsx`
- `app/tests/page.tsx`
- `app/tests/[id]/page.tsx`
- `app/events/page.tsx`
- `app/settings/page.tsx`
- `lib/supabase/schema.sql`
- `lib/supabase/migrations/*`

Likely files to add:

- reusable tracking helper files under `lib/` or `components/`
- setup docs for Vercel and GHL integration

## Recommendation

Proceed with an additive multi-funnel implementation that preserves the current A/B event pipeline, treats funnel project as the primary reporting context, and uses Vercel as the identity source for session, variant, and product state.
