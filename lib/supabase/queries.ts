import 'server-only'

import { unstable_noStore as noStore } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import type {
    ABEvent,
    ABTest,
    ABVariant,
    ChartDataPoint,
    DashboardKPIs,
    EventType,
    RecentEvent,
    TrackingPayload,
    VariantStats,
} from '@/types'

type VariantEventCount = {
    variant_id: string
    event_type: string
    count: number
}

type EventQueryOptions = {
    testId?: string
    limit?: number
    since?: string
}

type DashboardDataset = {
    test: ABTest | null
    kpis: DashboardKPIs
    variants: VariantStats[]
    events: RecentEvent[]
    chartData: ChartDataPoint[]
}

const PAGE_VIEW_EVENT: EventType = 'page_view'
const CTA_CLICK_EVENT: EventType = 'cta_click'
const PURCHASE_EVENT: EventType = 'purchase'
const SUPABASE_MAX_ROWS_PER_REQUEST = 1_000

const MINUTE_IN_MS = 60_000
const HOUR_IN_MS = 60 * MINUTE_IN_MS
const DAY_IN_MS = 24 * HOUR_IN_MS

function round(value: number, decimals = 1): number {
    return Number(value.toFixed(decimals))
}

function percentage(numerator: number, denominator: number, decimals = 1): number {
    if (denominator <= 0) return 0
    return round((numerator / denominator) * 100, decimals)
}

function erf(value: number): number {
    const sign = value < 0 ? -1 : 1
    const x = Math.abs(value)
    const a1 = 0.254829592
    const a2 = -0.284496736
    const a3 = 1.421413741
    const a4 = -1.453152027
    const a5 = 1.061405429
    const p = 0.3275911
    const t = 1 / (1 + p * x)
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

    return sign * y
}

function normalCdf(value: number): number {
    return 0.5 * (1 + erf(value / Math.SQRT2))
}

function formatTimeAgo(createdAt: string): string {
    const diff = Math.max(0, Date.now() - new Date(createdAt).getTime())

    if (diff < HOUR_IN_MS) {
        const minutes = Math.max(1, Math.floor(diff / MINUTE_IN_MS))
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
    }

    if (diff < DAY_IN_MS) {
        const hours = Math.max(1, Math.floor(diff / HOUR_IN_MS))
        return `${hours} hour${hours === 1 ? '' : 's'} ago`
    }

    const days = Math.max(1, Math.floor(diff / DAY_IN_MS))
    return `${days} day${days === 1 ? '' : 's'} ago`
}

function getEventCount(countMap: Map<string, number>, variantId: string, eventType: string): number {
    return Number(countMap.get(`${variantId}:${eventType}`) ?? 0)
}

function calculateConfidence(control?: VariantStats, leader?: VariantStats): number {
    if (!control || !leader || control.variant_key === leader.variant_key) {
        return 0
    }

    if (control.visitors <= 0 || leader.visitors <= 0) {
        return 0
    }

    const pooledRate = (control.clicks + leader.clicks) / (control.visitors + leader.visitors)
    const standardError = Math.sqrt(
        pooledRate *
        (1 - pooledRate) *
        ((1 / control.visitors) + (1 / leader.visitors))
    )

    if (!Number.isFinite(standardError) || standardError <= 0) {
        return 0
    }

    const zScore = ((leader.ctr / 100) - (control.ctr / 100)) / standardError

    if (!Number.isFinite(zScore) || zScore <= 0) {
        return 0
    }

    return round(Math.min(100, normalCdf(zScore) * 100), 1)
}

function buildVariantStats(
    variants: ABVariant[],
    counts: VariantEventCount[],
): VariantStats[] {
    const countMap = new Map<string, number>(
        counts.map(({ variant_id, event_type, count }) => [
            `${variant_id}:${event_type}`,
            Number(count ?? 0),
        ]),
    )

    const baseStats = variants.map((variant) => {
        const visitors = getEventCount(countMap, variant.id, PAGE_VIEW_EVENT)
        const clicks = getEventCount(countMap, variant.id, CTA_CLICK_EVENT)
        const purchases = getEventCount(countMap, variant.id, PURCHASE_EVENT)
        const ctr = percentage(clicks, visitors, 1)
        const purchaseRate = percentage(purchases, visitors, 2)

        return {
            variant_key: variant.variant_key,
            headline: variant.headline,
            is_control: variant.is_control,
            is_leader: false,
            visitors,
            clicks,
            ctr,
            conversions: clicks,
            conversion_rate: ctr,
            purchases,
            purchase_conversion_rate: purchaseRate,
            lift: 0,
        } satisfies VariantStats
    })

    const control = baseStats.find((variant) => variant.is_control) ?? baseStats[0]
    const leader = [...baseStats].sort((left, right) => {
        if (right.ctr !== left.ctr) return right.ctr - left.ctr
        if (right.clicks !== left.clicks) return right.clicks - left.clicks
        return right.visitors - left.visitors
    })[0]

    const controlCtr = control?.ctr ?? 0

    return baseStats.map((variant) => ({
        ...variant,
        is_leader: leader ? variant.variant_key === leader.variant_key : false,
        lift: !control || variant.variant_key === control.variant_key || controlCtr <= 0
            ? 0
            : round(((variant.ctr - controlCtr) / controlCtr) * 100, 1),
    }))
}

function buildDashboardKPIs(variants: VariantStats[]): DashboardKPIs {
    const totalVisitors = variants.reduce((sum, variant) => sum + variant.visitors, 0)
    const totalClicks = variants.reduce((sum, variant) => sum + variant.clicks, 0)
    const totalPurchases = variants.reduce((sum, variant) => sum + variant.purchases, 0)
    const leader = variants.find((variant) => variant.is_leader) ?? variants[0]
    const control = variants.find((variant) => variant.is_control) ?? variants[0]

    return {
        total_visitors: totalVisitors,
        total_clicks: totalClicks,
        total_purchases: totalPurchases,
        conversion_rate: percentage(totalClicks, totalVisitors, 1),
        purchase_conversion_rate: percentage(totalPurchases, totalVisitors, 2),
        leader_variant: leader?.variant_key ?? '—',
        leader_metric: 'ctr',
        confidence_level: calculateConfidence(control, leader),
    }
}

function markLiveQuery() {
    noStore()
}

async function queryEvents({
    testId,
    limit,
    since,
}: EventQueryOptions = {}): Promise<ABEvent[]> {
    markLiveQuery()
    const supabase = getSupabaseAdmin()
    const rows: ABEvent[] = []
    let offset = 0

    while (true) {
        const remaining = typeof limit === 'number'
            ? limit - rows.length
            : SUPABASE_MAX_ROWS_PER_REQUEST

        if (typeof limit === 'number' && remaining <= 0) {
            break
        }

        const batchSize = typeof limit === 'number'
            ? Math.min(remaining, SUPABASE_MAX_ROWS_PER_REQUEST)
            : SUPABASE_MAX_ROWS_PER_REQUEST

        let query = supabase
            .from('ab_events')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + batchSize - 1)

        if (testId) {
            query = query.eq('test_id', testId)
        }

        if (since) {
            query = query.gte('created_at', since)
        }

        const { data, error } = await query

        if (error) {
            throw new Error(`queryEvents: ${error.message}`)
        }

        const batch = data ?? []
        rows.push(...batch)

        if (batch.length < batchSize) {
            break
        }

        offset += batch.length
    }

    return rows
}

async function buildVariantLookup(testIds: string[]): Promise<Map<string, ABVariant>> {
    const uniqueTestIds = [...new Set(testIds)]
    const variants = await Promise.all(uniqueTestIds.map((testId) => getVariantsByTestId(testId)))

    return new Map(
        variants
            .flat()
            .map((variant) => [variant.id, variant] as const),
    )
}

// ====================
// AB Tests
// ====================

export async function getTests(): Promise<ABTest[]> {
    markLiveQuery()
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .from('ab_tests')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw new Error(`getTests: ${error.message}`)
    return data ?? []
}

export async function getTestByKey(testKey: string): Promise<ABTest | null> {
    markLiveQuery()
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .from('ab_tests')
        .select('*')
        .eq('test_key', testKey)
        .single()

    if (error && error.code !== 'PGRST116') throw new Error(`getTestByKey: ${error.message}`)
    return data ?? null
}

export async function getTestById(id: string): Promise<ABTest | null> {
    markLiveQuery()
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .from('ab_tests')
        .select('*')
        .eq('id', id)
        .single()

    if (error && error.code !== 'PGRST116') throw new Error(`getTestById: ${error.message}`)
    return data ?? null
}

// ====================
// AB Variants
// ====================

export async function getVariantsByTestId(testId: string): Promise<ABVariant[]> {
    markLiveQuery()
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .from('ab_variants')
        .select('*')
        .eq('test_id', testId)
        .order('variant_key', { ascending: true })

    if (error) throw new Error(`getVariantsByTestId: ${error.message}`)
    return data ?? []
}

export async function getVariantByKey(testId: string, variantKey: string): Promise<ABVariant | null> {
    markLiveQuery()
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .from('ab_variants')
        .select('*')
        .eq('test_id', testId)
        .eq('variant_key', variantKey.trim().toUpperCase())
        .single()

    if (error && error.code !== 'PGRST116') throw new Error(`getVariantByKey: ${error.message}`)
    return data ?? null
}

// ====================
// AB Events
// ====================

export async function insertEvent(payload: TrackingPayload): Promise<ABEvent> {
    const supabase = getSupabaseAdmin()

    const test = await getTestByKey(payload.test_key)
    if (!test) throw new Error(`Test not found: ${payload.test_key}`)

    const variant = await getVariantByKey(test.id, payload.variant)
    if (!variant) throw new Error(`Variant not found: ${payload.variant} in test ${payload.test_key}`)

    const { data, error } = await supabase
        .from('ab_events')
        .insert({
            test_id: test.id,
            variant_id: variant.id,
            event_type: payload.event,
            page_url: payload.page_url,
            page_path: payload.page_path,
            user_agent: payload.user_agent ?? null,
            revenue_value: payload.revenue_value ?? null,
            metadata: payload.metadata ?? null,
            created_at: payload.timestamp,
        })
        .select()
        .single()

    if (error) throw new Error(`insertEvent: ${error.message}`)
    return data
}

export async function getEventsByTestId(testId: string, limit = 50): Promise<ABEvent[]> {
    return queryEvents({ testId, limit })
}

export async function getRecentEvents(limit = 50): Promise<ABEvent[]> {
    return queryEvents({ limit })
}

export async function getEventsSince(
    since: string,
    testId?: string,
    limit?: number,
): Promise<ABEvent[]> {
    return queryEvents({ since, testId, limit })
}

// ====================
// Analytics Aggregation
// ====================

export async function getVariantEventCounts(testId: string): Promise<VariantEventCount[]> {
    markLiveQuery()
    const events = await queryEvents({ testId })
    const countsByVariant: Record<string, Record<string, number>> = {}

    for (const event of events) {
        if (!countsByVariant[event.variant_id]) {
            countsByVariant[event.variant_id] = {}
        }

        countsByVariant[event.variant_id][event.event_type] =
            (countsByVariant[event.variant_id][event.event_type] ?? 0) + 1
    }

    return Object.entries(countsByVariant).flatMap(([variant_id, counts]) =>
        Object.entries(counts).map(([event_type, count]) => ({ variant_id, event_type, count })),
    )
}

export async function getVariantStats(testId: string): Promise<VariantStats[]> {
    const [variants, counts] = await Promise.all([
        getVariantsByTestId(testId),
        getVariantEventCounts(testId),
    ])

    return buildVariantStats(variants, counts)
}

export async function getDashboardKPIs(testId: string): Promise<DashboardKPIs> {
    const variants = await getVariantStats(testId)
    return buildDashboardKPIs(variants)
}

export async function getDailyCtrChartData(testId: string, days = 7): Promise<ChartDataPoint[]> {
    const [variants, events] = await Promise.all([
        getVariantsByTestId(testId),
        (() => {
            const start = new Date()
            start.setUTCHours(0, 0, 0, 0)
            start.setUTCDate(start.getUTCDate() - Math.max(days - 1, 0))
            return getEventsSince(start.toISOString(), testId)
        })(),
    ])

    if (!variants.length) {
        return []
    }

    const start = new Date()
    start.setUTCHours(0, 0, 0, 0)
    start.setUTCDate(start.getUTCDate() - Math.max(days - 1, 0))

    const variantKeyById = new Map(variants.map((variant) => [variant.id, variant.variant_key]))
    const eventBuckets = new Map<string, { views: number; clicks: number }>()
    const rows: Array<{ dayKey: string; row: ChartDataPoint }> = []

    for (let index = 0; index < days; index += 1) {
        const currentDay = new Date(start)
        currentDay.setUTCDate(start.getUTCDate() + index)

        const dayKey = currentDay.toISOString().slice(0, 10)
        const row: ChartDataPoint = {
            date: currentDay.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC',
            }),
        }

        for (const variant of variants) {
            row[variant.variant_key] = 0
        }

        rows.push({ dayKey, row })
    }

    for (const event of events) {
        const variantKey = variantKeyById.get(event.variant_id)
        const dayKey = event.created_at.slice(0, 10)

        if (!variantKey || !rows.find((row) => row.dayKey === dayKey)) {
            continue
        }

        const bucketKey = `${dayKey}:${variantKey}`
        const bucket = eventBuckets.get(bucketKey) ?? { views: 0, clicks: 0 }

        if (event.event_type === PAGE_VIEW_EVENT) {
            bucket.views += 1
        }

        if (event.event_type === CTA_CLICK_EVENT) {
            bucket.clicks += 1
        }

        eventBuckets.set(bucketKey, bucket)
    }

    for (const { dayKey, row } of rows) {
        for (const variant of variants) {
            const bucket = eventBuckets.get(`${dayKey}:${variant.variant_key}`)
            row[variant.variant_key] = percentage(bucket?.clicks ?? 0, bucket?.views ?? 0, 1)
        }
    }

    return rows.map(({ row }) => row)
}

export async function getRecentActivity(limit = 5, testId?: string): Promise<RecentEvent[]> {
    const events = testId
        ? await getEventsByTestId(testId, limit)
        : await getRecentEvents(limit)

    if (!events.length) {
        return []
    }

    const [tests, variantsById] = await Promise.all([
        getTests(),
        buildVariantLookup(events.map((event) => event.test_id)),
    ])

    const testById = new Map(tests.map((test) => [test.id, test]))

    return events.map((event) => {
        const variant = variantsById.get(event.variant_id)
        const test = testById.get(event.test_id)
        const eventLabel =
            event.event_type === CTA_CLICK_EVENT
                ? 'CTA click'
                : event.event_type === PURCHASE_EVENT
                    ? 'Purchase'
                    : 'Page view'
        const location = event.page_path ?? event.page_url ?? 'the funnel'

        return {
            id: event.id,
            title: `${eventLabel} on Variant ${variant?.variant_key ?? 'Unknown'}`,
            description: `${test?.name ?? 'Live test'} recorded ${eventLabel.toLowerCase()} on ${location}.`,
            time_ago: formatTimeAgo(event.created_at),
            type: event.event_type === PAGE_VIEW_EVENT ? 'info' : 'success',
        }
    })
}

export async function getRecentEventFeed(limit = 50) {
    const events = await getRecentEvents(limit)

    if (!events.length) {
        return []
    }

    const [tests, variantsById] = await Promise.all([
        getTests(),
        buildVariantLookup(events.map((event) => event.test_id)),
    ])

    const testById = new Map(tests.map((test) => [test.id, test]))

    return events.map((event) => ({
        id: event.id,
        event_type: event.event_type,
        test_id: event.test_id,
        test_name: testById.get(event.test_id)?.name ?? 'Unknown Test',
        variant_id: event.variant_id,
        variant_key: variantsById.get(event.variant_id)?.variant_key ?? '—',
        page_url: event.page_url,
        page_path: event.page_path,
        created_at: event.created_at,
        status: Date.now() - new Date(event.created_at).getTime() <= 5 * MINUTE_IN_MS ? 'live' : 'logged',
    }))
}

export async function getTestsWithAnalytics() {
    const tests = await getTests()

    return Promise.all(
        tests.map(async (test) => {
            const [variants, counts] = await Promise.all([
                getVariantsByTestId(test.id),
                getVariantEventCounts(test.id),
            ])
            const variantStats = buildVariantStats(variants, counts)
            const kpis = buildDashboardKPIs(variantStats)

            return {
                ...test,
                variant_count: variants.length,
                total_visitors: kpis.total_visitors,
                total_clicks: kpis.total_clicks,
                total_purchases: kpis.total_purchases,
                ctr: kpis.conversion_rate,
                purchase_conversion_rate: kpis.purchase_conversion_rate,
                leader_variant: kpis.leader_variant === '—' ? null : kpis.leader_variant,
                confidence_level: kpis.confidence_level,
            }
        }),
    )
}

export async function getDashboardDatasetByTestId(testId: string): Promise<DashboardDataset> {
    const test = await getTestById(testId)

    if (!test) {
        return {
            test: null,
            kpis: buildDashboardKPIs([]),
            variants: [],
            events: [],
            chartData: [],
        }
    }

    const [kpis, variants, events, chartData] = await Promise.all([
        getDashboardKPIs(test.id),
        getVariantStats(test.id),
        getRecentActivity(5, test.id),
        getDailyCtrChartData(test.id),
    ])

    return {
        test,
        kpis,
        variants,
        events,
        chartData,
    }
}

export async function getDashboardDatasetByTestKey(testKey: string): Promise<DashboardDataset> {
    const test = await getTestByKey(testKey)

    if (!test) {
        return {
            test: null,
            kpis: buildDashboardKPIs([]),
            variants: [],
            events: [],
            chartData: [],
        }
    }

    return getDashboardDatasetByTestId(test.id)
}
