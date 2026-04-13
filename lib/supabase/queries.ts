import 'server-only'

import { getSupabaseAdmin } from '@/lib/supabase-admin'
import type { ABTest, ABVariant, ABEvent, TrackingPayload } from '@/types'

// ====================
// AB Tests
// ====================

export async function getTests(): Promise<ABTest[]> {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .from('ab_tests')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw new Error(`getTests: ${error.message}`)
    return data ?? []
}

export async function getTestByKey(testKey: string): Promise<ABTest | null> {
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

    // Resolve test by test_key
    const test = await getTestByKey(payload.test_key)
    if (!test) throw new Error(`Test not found: ${payload.test_key}`)

    // Resolve variant
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
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .from('ab_events')
        .select('*')
        .eq('test_id', testId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) throw new Error(`getEventsByTestId: ${error.message}`)
    return data ?? []
}

export async function getRecentEvents(limit = 50): Promise<ABEvent[]> {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .from('ab_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) throw new Error(`getRecentEvents: ${error.message}`)
    return data ?? []
}

// ====================
// Analytics Aggregation
// ====================

/** Returns per-variant counts for visitors (page_view), clicks (cta_click), and purchases (purchase). */
export async function getVariantEventCounts(testId: string): Promise<
    Array<{ variant_id: string; event_type: string; count: number }>
> {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .rpc('get_variant_event_counts', { p_test_id: testId })

    if (error) {
        // Fallback: manual aggregation if the RPC function doesn't exist yet
        const events = await getEventsByTestId(testId, 10000)
        const map: Record<string, Record<string, number>> = {}
        for (const e of events) {
            if (!map[e.variant_id]) map[e.variant_id] = {}
            map[e.variant_id][e.event_type] = (map[e.variant_id][e.event_type] ?? 0) + 1
        }
        return Object.entries(map).flatMap(([variant_id, counts]) =>
            Object.entries(counts).map(([event_type, count]) => ({ variant_id, event_type, count }))
        )
    }

    return data ?? []
}
