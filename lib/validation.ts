import {
    TRACK_EVENT_TYPES,
    type TrackingPayload,
    type TrackEventType,
    type ValidationError,
} from '@/types'

const VALID_EVENTS = new Set<TrackEventType>(TRACK_EVENT_TYPES)
const PURCHASE_METADATA_FIELDS = ['order_id', 'product_name', 'customer_email', 'currency_code'] as const

type TrackingValidationOptions = {
    expectedEvent?: TrackEventType
    requirePageContext?: boolean
    metadataOverrides?: Record<string, unknown>
    extraMetadataFields?: readonly string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getOptionalTrimmedString(value: unknown): string | undefined {
    if (typeof value !== 'string') {
        return undefined
    }

    const trimmedValue = value.trim()
    return trimmedValue || undefined
}

function validatePayload(
    body: unknown,
    {
        expectedEvent,
        requirePageContext = true,
        metadataOverrides,
        extraMetadataFields = [],
    }: TrackingValidationOptions = {},
): {
    valid: boolean
    payload?: TrackingPayload
    errors: ValidationError[]
} {
    const errors: ValidationError[] = []

    if (!isRecord(body)) {
        return { valid: false, errors: [{ field: 'body', message: 'Request body must be a JSON object' }] }
    }

    const raw = body as Record<string, unknown>

    if (!raw.event) {
        errors.push({ field: 'event', message: 'event is required' })
    } else if (typeof raw.event !== 'string' || !VALID_EVENTS.has(raw.event as TrackEventType)) {
        errors.push({
            field: 'event',
            message: `event must be one of: ${TRACK_EVENT_TYPES.join(', ')}`,
        })
    } else if (expectedEvent && raw.event !== expectedEvent) {
        errors.push({ field: 'event', message: `event must be "${expectedEvent}"` })
    }

    if (!raw.test_key || typeof raw.test_key !== 'string' || raw.test_key.trim() === '') {
        errors.push({ field: 'test_key', message: 'test_key is required and must be a non-empty string' })
    }

    if (!raw.variant || typeof raw.variant !== 'string' || raw.variant.trim() === '') {
        errors.push({ field: 'variant', message: 'variant is required and must be a non-empty string' })
    }

    if (requirePageContext) {
        if (!raw.page_url || typeof raw.page_url !== 'string' || raw.page_url.trim() === '') {
            errors.push({ field: 'page_url', message: 'page_url is required and must be a non-empty string' })
        }

        if (!raw.page_path || typeof raw.page_path !== 'string' || raw.page_path.trim() === '') {
            errors.push({ field: 'page_path', message: 'page_path is required and must be a non-empty string' })
        }
    } else {
        if (raw.page_url !== undefined && (typeof raw.page_url !== 'string' || raw.page_url.trim() === '')) {
            errors.push({ field: 'page_url', message: 'page_url must be a non-empty string when provided' })
        }

        if (raw.page_path !== undefined && (typeof raw.page_path !== 'string' || raw.page_path.trim() === '')) {
            errors.push({ field: 'page_path', message: 'page_path must be a non-empty string when provided' })
        }
    }

    if (!raw.timestamp || typeof raw.timestamp !== 'string' || raw.timestamp.trim() === '') {
        errors.push({ field: 'timestamp', message: 'timestamp is required and must be a non-empty string' })
    } else if (Number.isNaN(Date.parse(raw.timestamp.trim()))) {
        errors.push({ field: 'timestamp', message: 'timestamp must be a valid ISO date string' })
    }

    if (
        raw.revenue_value !== undefined &&
        (typeof raw.revenue_value !== 'number' || !Number.isFinite(raw.revenue_value))
    ) {
        errors.push({ field: 'revenue_value', message: 'revenue_value must be a number' })
    }

    if (raw.user_agent !== undefined && typeof raw.user_agent !== 'string') {
        errors.push({ field: 'user_agent', message: 'user_agent must be a string' })
    }

    if (raw.metadata !== undefined && !isRecord(raw.metadata)) {
        errors.push({ field: 'metadata', message: 'metadata must be an object' })
    }

    const extraMetadata: Record<string, unknown> = {}

    for (const field of extraMetadataFields) {
        const value = raw[field]

        if (value === undefined || value === null) {
            continue
        }

        if (typeof value !== 'string') {
            errors.push({ field, message: `${field} must be a string` })
            continue
        }

        const trimmedValue = value.trim()

        if (trimmedValue) {
            extraMetadata[field] = trimmedValue
        }
    }

    if (errors.length > 0) return { valid: false, errors }

    const mergedMetadata = {
        ...(isRecord(raw.metadata) ? raw.metadata : {}),
        ...extraMetadata,
        ...(metadataOverrides ?? {}),
    }

    const payload: TrackingPayload = {
        event: raw.event as TrackEventType,
        test_key: (raw.test_key as string).trim(),
        variant: (raw.variant as string).trim().toUpperCase(),
        page_url: getOptionalTrimmedString(raw.page_url),
        page_path: getOptionalTrimmedString(raw.page_path),
        timestamp: (raw.timestamp as string).trim(),
        user_agent: getOptionalTrimmedString(raw.user_agent),
        revenue_value: raw.revenue_value as number | undefined,
        metadata: Object.keys(mergedMetadata).length > 0 ? mergedMetadata : undefined,
    }

    return { valid: true, payload, errors: [] }
}

/**
 * Validates a raw tracking payload from the GHL funnel.
 * Returns an array of validation errors (empty = valid).
 */
export function validateTrackingPayload(body: unknown): {
    valid: boolean
    payload?: TrackingPayload
    errors: ValidationError[]
} {
    return validatePayload(body)
}

export function validatePurchaseTrackingPayload(body: unknown): {
    valid: boolean
    payload?: TrackingPayload
    errors: ValidationError[]
} {
    return validatePayload(body, {
        expectedEvent: 'purchase',
        requirePageContext: false,
        extraMetadataFields: PURCHASE_METADATA_FIELDS,
        metadataOverrides: { source: 'ghl_workflow_webhook' },
    })
}

export function formatValidationErrors(errors: ValidationError[]): string {
    return errors.map(({ field, message }) => `${field}: ${message}`).join('; ')
}
