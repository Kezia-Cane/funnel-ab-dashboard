import type { TrackingPayload, ValidationError } from '@/types'

const VALID_EVENTS = ['page_view', 'cta_click', 'conversion', 'purchase'] as const
const VALID_VARIANTS = ['A', 'B', 'C', 'D', 'E'] // extendable

/**
 * Validates a raw tracking payload from the GHL funnel.
 * Returns an array of validation errors (empty = valid).
 */
export function validateTrackingPayload(body: unknown): {
    valid: boolean
    payload?: TrackingPayload
    errors: ValidationError[]
} {
    const errors: ValidationError[] = []

    if (!body || typeof body !== 'object') {
        return { valid: false, errors: [{ field: 'body', message: 'Request body must be a JSON object' }] }
    }

    const raw = body as Record<string, unknown>

    // Required: event
    if (!raw.event) {
        errors.push({ field: 'event', message: 'event is required' })
    } else if (!VALID_EVENTS.includes(raw.event as typeof VALID_EVENTS[number])) {
        errors.push({ field: 'event', message: `event must be one of: ${VALID_EVENTS.join(', ')}` })
    }

    // Required: test_key
    if (!raw.test_key || typeof raw.test_key !== 'string' || raw.test_key.trim() === '') {
        errors.push({ field: 'test_key', message: 'test_key is required and must be a non-empty string' })
    }

    // Required: variant
    if (!raw.variant || typeof raw.variant !== 'string') {
        errors.push({ field: 'variant', message: 'variant is required' })
    } else if (!VALID_VARIANTS.includes(raw.variant.toUpperCase())) {
        errors.push({ field: 'variant', message: `variant must be one of: ${VALID_VARIANTS.join(', ')}` })
    }

    // Optional: revenue_value must be a number if present
    if (raw.revenue_value !== undefined && typeof raw.revenue_value !== 'number') {
        errors.push({ field: 'revenue_value', message: 'revenue_value must be a number' })
    }

    if (errors.length > 0) return { valid: false, errors }

    const payload: TrackingPayload = {
        event: raw.event as TrackingPayload['event'],
        test_key: (raw.test_key as string).trim(),
        variant: (raw.variant as string).toUpperCase(),
        page_url: raw.page_url as string | undefined,
        page_path: raw.page_path as string | undefined,
        timestamp: raw.timestamp as string | undefined,
        user_agent: raw.user_agent as string | undefined,
        revenue_value: raw.revenue_value as number | undefined,
        metadata: raw.metadata as Record<string, unknown> | undefined,
    }

    return { valid: true, payload, errors: [] }
}
