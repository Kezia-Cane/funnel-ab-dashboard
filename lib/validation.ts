import {
    TRACK_EVENT_TYPES,
    type TrackingPayload,
    type TrackEventType,
    type ValidationError,
} from '@/types'

const VALID_EVENTS = new Set<TrackEventType>(TRACK_EVENT_TYPES)

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
    } else if (typeof raw.event !== 'string' || !VALID_EVENTS.has(raw.event as TrackEventType)) {
        errors.push({
            field: 'event',
            message: `event must be one of: ${TRACK_EVENT_TYPES.join(', ')}`,
        })
    }

    // Required: test_key
    if (!raw.test_key || typeof raw.test_key !== 'string' || raw.test_key.trim() === '') {
        errors.push({ field: 'test_key', message: 'test_key is required and must be a non-empty string' })
    }

    // Required: variant
    if (!raw.variant || typeof raw.variant !== 'string' || raw.variant.trim() === '') {
        errors.push({ field: 'variant', message: 'variant is required and must be a non-empty string' })
    }

    // Required: page_url
    if (!raw.page_url || typeof raw.page_url !== 'string' || raw.page_url.trim() === '') {
        errors.push({ field: 'page_url', message: 'page_url is required and must be a non-empty string' })
    }

    // Required: page_path
    if (!raw.page_path || typeof raw.page_path !== 'string' || raw.page_path.trim() === '') {
        errors.push({ field: 'page_path', message: 'page_path is required and must be a non-empty string' })
    }

    // Required: timestamp
    if (!raw.timestamp || typeof raw.timestamp !== 'string' || raw.timestamp.trim() === '') {
        errors.push({ field: 'timestamp', message: 'timestamp is required and must be a non-empty string' })
    } else if (Number.isNaN(Date.parse(raw.timestamp.trim()))) {
        errors.push({ field: 'timestamp', message: 'timestamp must be a valid ISO date string' })
    }

    // Optional: revenue_value must be a number if present
    if (
        raw.revenue_value !== undefined &&
        (typeof raw.revenue_value !== 'number' || !Number.isFinite(raw.revenue_value))
    ) {
        errors.push({ field: 'revenue_value', message: 'revenue_value must be a number' })
    }

    if (raw.user_agent !== undefined && typeof raw.user_agent !== 'string') {
        errors.push({ field: 'user_agent', message: 'user_agent must be a string' })
    }

    if (
        raw.metadata !== undefined &&
        (typeof raw.metadata !== 'object' || raw.metadata === null || Array.isArray(raw.metadata))
    ) {
        errors.push({ field: 'metadata', message: 'metadata must be an object' })
    }

    if (errors.length > 0) return { valid: false, errors }

    const payload: TrackingPayload = {
        event: raw.event as TrackEventType,
        test_key: (raw.test_key as string).trim(),
        variant: (raw.variant as string).trim().toUpperCase(),
        page_url: (raw.page_url as string).trim(),
        page_path: (raw.page_path as string).trim(),
        timestamp: (raw.timestamp as string).trim(),
        user_agent:
            typeof raw.user_agent === 'string' && raw.user_agent.trim()
                ? raw.user_agent.trim()
                : undefined,
        revenue_value: raw.revenue_value as number | undefined,
        metadata: raw.metadata as Record<string, unknown> | undefined,
    }

    return { valid: true, payload, errors: [] }
}
