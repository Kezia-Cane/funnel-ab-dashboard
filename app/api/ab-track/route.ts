import { NextRequest, NextResponse } from 'next/server'
import { validateTrackingPayload } from '@/lib/validation'
import { insertEvent } from '@/lib/supabase/queries'

// CORS headers — allows the GHL funnel (any origin) to POST events
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Pre-flight OPTIONS handler (required for cross-origin POST from GHL)
export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

/**
 * POST /api/ab-track
 *
 * Receives tracking events from the GHL funnel JavaScript.
 * Validates the payload, resolves test + variant IDs, inserts into Supabase.
 *
 * Expected body:
 * {
 *   "event":     "page_view" | "cta_click" | "conversion",
 *   "test_key":  "nad_headline_test_v1",
 *   "variant":   "B",
 *   "page_url":  "https://example.com/funnel",  (optional)
 *   "page_path": "/funnel",                      (optional)
 *   "timestamp": "2026-04-07T10:00:00.000Z",    (optional)
 *   "user_agent":"Mozilla/5.0 ...",              (optional)
 * }
 */
export async function POST(req: NextRequest) {
    try {
        // Parse body
        let body: unknown
        try {
            body = await req.json()
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON body' },
                { status: 400, headers: CORS_HEADERS }
            )
        }

        // Validate
        const { valid, payload, errors } = validateTrackingPayload(body)
        if (!valid || !payload) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: errors },
                { status: 422, headers: CORS_HEADERS }
            )
        }

        // Attach user_agent from request header if not provided in payload
        if (!payload.user_agent) {
            payload.user_agent = req.headers.get('user-agent') ?? undefined
        }

        // Store event in Supabase
        const event = await insertEvent(payload)

        return NextResponse.json(
            {
                success: true,
                received: true,
                event_id: event.id,
                timestamp: event.created_at,
            },
            { status: 200, headers: CORS_HEADERS }
        )
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error'

        // Don't expose internal Supabase errors to the public — log and return generic message
        console.error('[ab-track]', message)

        return NextResponse.json(
            { success: false, error: 'Failed to record event. Please try again.' },
            { status: 500, headers: CORS_HEADERS }
        )
    }
}
