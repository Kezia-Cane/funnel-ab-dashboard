import { NextRequest } from 'next/server'

import {
    authorizeTrackingRequest,
    insertEventErrorResponse,
    jsonResponse,
    methodNotAllowedResponse,
    readJsonRequest,
} from '@/lib/api/tracking-route'
import { insertEvent } from '@/lib/supabase/queries'
import { formatValidationErrors, validatePurchaseTrackingPayload } from '@/lib/validation'

export const runtime = 'nodejs'

const PURCHASE_ALLOWED_METHODS = 'POST'

async function rejectMethod() {
    return methodNotAllowedResponse(PURCHASE_ALLOWED_METHODS)
}

export const GET = rejectMethod
export const PUT = rejectMethod
export const PATCH = rejectMethod
export const DELETE = rejectMethod
export const OPTIONS = rejectMethod

export async function POST(request: NextRequest) {
    const authResult = authorizeTrackingRequest(request, {
        allowedMethods: PURCHASE_ALLOWED_METHODS,
    })

    if (authResult.response) {
        return authResult.response
    }

    const bodyResult = await readJsonRequest(
        request,
        authResult.config.allowedOrigin,
        PURCHASE_ALLOWED_METHODS,
    )

    if (bodyResult.response) {
        return bodyResult.response
    }

    const parsed = validatePurchaseTrackingPayload(bodyResult.body)

    if (!parsed.valid || !parsed.payload) {
        return jsonResponse(
            {
                success: false,
                message: formatValidationErrors(parsed.errors),
            },
            400,
            authResult.config.allowedOrigin,
            PURCHASE_ALLOWED_METHODS,
        )
    }

    try {
        await insertEvent(parsed.payload)
    } catch (error) {
        return insertEventErrorResponse(error, authResult.config.allowedOrigin, PURCHASE_ALLOWED_METHODS)
    }

    return jsonResponse(
        {
            success: true,
            message: 'Purchase event received',
        },
        200,
        authResult.config.allowedOrigin,
        PURCHASE_ALLOWED_METHODS,
    )
}
