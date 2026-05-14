import { NextRequest, NextResponse } from 'next/server'

import {
    authorizeTrackingRequest,
    getCorsHeaders,
    getOptionalAllowedOrigin,
    insertEventErrorResponse,
    jsonResponse,
    readJsonRequest,
} from '@/lib/api/tracking-route'
import { isSecretRequiredForTrackEvent } from '@/lib/api/tracking-policy'
import { insertEvent } from '@/lib/supabase/queries'
import { formatValidationErrors, validateTrackingPayload } from '@/lib/validation'

export const runtime = 'nodejs'

const TRACK_ALLOWED_METHODS = 'GET, POST, OPTIONS'

export async function GET() {
    return jsonResponse(
        {
            success: true,
            message: 'A/B tracking API is healthy',
        },
        200,
        getOptionalAllowedOrigin(),
        TRACK_ALLOWED_METHODS,
    )
}

export async function OPTIONS(request: NextRequest) {
    const authResult = authorizeTrackingRequest(request, {
        allowedMethods: TRACK_ALLOWED_METHODS,
        requireSecret: false,
    })

    if (authResult.response) {
        return authResult.response
    }

    return new NextResponse(null, {
        status: 200,
        headers: getCorsHeaders(authResult.config.allowedOrigin, TRACK_ALLOWED_METHODS),
    })
}

export async function POST(request: NextRequest) {
    const authResult = authorizeTrackingRequest(request, {
        allowedMethods: TRACK_ALLOWED_METHODS,
        requireSecret: false,
    })

    if (authResult.response) {
        return authResult.response
    }

    const bodyResult = await readJsonRequest(
        request,
        authResult.config.allowedOrigin,
        TRACK_ALLOWED_METHODS,
    )

    if (bodyResult.response) {
        return bodyResult.response
    }

    const parsed = validateTrackingPayload(bodyResult.body)

    if (!parsed.valid || !parsed.payload) {
        return jsonResponse(
            {
                success: false,
                message: formatValidationErrors(parsed.errors),
            },
            400,
            authResult.config.allowedOrigin,
            TRACK_ALLOWED_METHODS,
        )
    }

    if (isSecretRequiredForTrackEvent(parsed.payload.event)) {
        const requestSecret = request.headers.get('x-ab-track-secret')?.trim()

        if (!requestSecret || requestSecret !== authResult.config.apiSecret) {
            return jsonResponse(
                {
                    success: false,
                    message: 'Unauthorized',
                },
                401,
                authResult.config.allowedOrigin,
                TRACK_ALLOWED_METHODS,
            )
        }
    }

    try {
        await insertEvent(parsed.payload)
    } catch (error) {
        return insertEventErrorResponse(error, authResult.config.allowedOrigin, TRACK_ALLOWED_METHODS)
    }

    return jsonResponse(
        {
            success: true,
            message: 'Tracking event received',
        },
        200,
        authResult.config.allowedOrigin,
        TRACK_ALLOWED_METHODS,
    )
}
