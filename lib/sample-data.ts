/**
 * Sample/mock data for local development and UI demonstration.
 * Used when Supabase is not connected or for seeding the database.
 */
import type {
    ABTest,
    ABVariant,
    ABEvent,
    VariantStats,
    DashboardKPIs,
    ChartDataPoint,
    RecentEvent,
} from '@/types'

export const SAMPLE_TEST: ABTest = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'NAD Headline Test V1',
    test_key: 'nad_headline_test_v1',
    description: 'Optimizing landing page conversion via hero headline iteration.',
    status: 'active',
    created_at: '2024-01-12T00:00:00.000Z',
}

export const SAMPLE_TESTS: ABTest[] = [
    SAMPLE_TEST,
    {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Checkout Button Color',
        test_key: 'checkout_btn_color_v1',
        description: 'Testing button color variants on the payment page.',
        status: 'completed',
        created_at: '2023-09-15T00:00:00.000Z',
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Hero Section Image V2',
        test_key: 'hero_image_v2',
        description: 'Image variant testing on the global site hero.',
        status: 'draft',
        created_at: '2024-01-28T00:00:00.000Z',
    },
]

export const SAMPLE_VARIANTS: ABVariant[] = [
    {
        id: 'v-550e8400-a000',
        test_id: SAMPLE_TEST.id,
        variant_key: 'A',
        headline: 'Feel 20 Years Younger in 30 Days or Your Money Back',
        subheadline: 'Stop guessing. Our clinically-backed NAD+ formula targets the root cause of low energy and accelerates cellular recovery.',
        is_control: true,
        created_at: '2024-01-12T00:00:00.000Z',
    },
    {
        id: 'v-550e8400-b000',
        test_id: SAMPLE_TEST.id,
        variant_key: 'B',
        headline: 'The Science-Backed Secret to Unstoppable Energy After 40',
        subheadline: 'The data-backed NAD+ formula trusted by 50,000+ men who refuse to slow down. Engineered for peak performance at any age.',
        is_control: false,
        created_at: '2024-01-12T00:00:00.000Z',
    },
    {
        id: 'v-550e8400-c000',
        test_id: SAMPLE_TEST.id,
        variant_key: 'C',
        headline: 'Recharge Your Body at the Cellular Level — Starting Today',
        subheadline: 'Finally, a supplement that thinks like a biochemist and performs like a growth hacker. Join 50,000+ men optimizing their biology.',
        is_control: false,
        created_at: '2024-01-12T00:00:00.000Z',
    },
]

export const SAMPLE_VARIANT_STATS: VariantStats[] = [
    {
        variant_key: 'A',
        headline: 'Feel 20 Years Younger in 30 Days or Your Money Back',
        is_control: true,
        is_leader: false,
        visitors: 4120,
        clicks: 321,
        ctr: 7.8,
        conversions: 173,
        conversion_rate: 4.2,
        purchases: 18,
        purchase_conversion_rate: 0.44,
        lift: 0,
    },
    {
        variant_key: 'B',
        headline: 'The Science-Backed Secret to Unstoppable Energy After 40',
        is_control: false,
        is_leader: true,
        visitors: 4152,
        clicks: 514,
        ctr: 12.4,
        conversions: 282,
        conversion_rate: 6.8,
        purchases: 45,
        purchase_conversion_rate: 1.08,
        lift: 61.9,
    },
    {
        variant_key: 'C',
        headline: 'Recharge Your Body at the Cellular Level — Starting Today',
        is_control: false,
        is_leader: false,
        visitors: 4128,
        clicks: 365,
        ctr: 8.8,
        conversions: 211,
        conversion_rate: 5.1,
        purchases: 22,
        purchase_conversion_rate: 0.53,
        lift: 21.4,
    },
]

export const SAMPLE_KPIS: DashboardKPIs = {
    total_visitors: 12400,
    total_clicks: 1200,
    total_purchases: 85,
    conversion_rate: 9.7,
    purchase_conversion_rate: 0.69,
    leader_variant: 'B',
    leader_metric: 'purchase',
    confidence_level: 94.2,
}

export const SAMPLE_CHART_DATA: ChartDataPoint[] = [
    { date: 'Jan 12', variantA: 3.8, variantB: 3.9, variantC: 3.7 },
    { date: 'Jan 15', variantA: 4.1, variantB: 4.8, variantC: 4.2 },
    { date: 'Jan 18', variantA: 3.9, variantB: 5.6, variantC: 4.4 },
    { date: 'Jan 21', variantA: 4.0, variantB: 6.1, variantC: 4.8 },
    { date: 'Jan 24', variantA: 4.2, variantB: 6.5, variantC: 5.0 },
    { date: 'Today', variantA: 4.2, variantB: 6.8, variantC: 5.1 },
]

export const SAMPLE_RECENT_EVENTS: RecentEvent[] = [
    {
        id: 're-1',
        title: 'Statistical Leader Identified',
        description: 'Variant B surpassed Variant A at 90% confidence.',
        time_ago: '2 hours ago',
        type: 'success',
    },
    {
        id: 're-2',
        title: 'Purchase Milestone',
        description: 'Variant B surpassed 40 confirmed purchases.',
        time_ago: '6 hours ago',
        type: 'success',
    },
    {
        id: 're-3',
        title: 'Traffic Peak Detected',
        description: 'Social campaign launch triggered 300% traffic spike.',
        time_ago: '14 hours ago',
        type: 'info',
    },
]

// Sample raw events for the Event Logs page
export const SAMPLE_EVENTS: Array<{
    id: string
    event_type: string
    variant: string
    page_path: string
    timestamp: string
    status: 'live' | 'logged' | 'warn'
}> = [
        { id: 'ev-1', event_type: 'page_view', variant: 'Variant B', page_path: '/funnel', timestamp: '14:03:11.452', status: 'live' },
        { id: 'ev-2', event_type: 'purchase', variant: 'Variant B', page_path: '/funnel/confirm', timestamp: '14:02:08.119', status: 'live' },
        { id: 'ev-3', event_type: 'page_view', variant: 'Variant C', page_path: '/funnel/checkout', timestamp: '14:01:55.221', status: 'logged' },
        { id: 'ev-4', event_type: 'cta_click', variant: 'Variant B', page_path: '/funnel', timestamp: '14:01:42.004', status: 'live' },
        { id: 'ev-5', event_type: 'purchase', variant: 'Variant A', page_path: '/funnel/confirm', timestamp: '14:01:38.882', status: 'logged' },
        { id: 'ev-6', event_type: 'cta_click', variant: 'Variant C', page_path: '/funnel', timestamp: '13:58:22.110', status: 'live' },
        { id: 'ev-7', event_type: 'page_view', variant: 'Variant B', page_path: '/funnel/checkout', timestamp: '13:55:10.007', status: 'logged' },
        { id: 'ev-8', event_type: 'conversion', variant: 'Variant B', page_path: '/funnel/checkout', timestamp: '13:50:33.441', status: 'warn' },
    ]
