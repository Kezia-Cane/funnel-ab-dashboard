import { NextRequest } from 'next/server'

import { buildPublicTestDefinition } from '@/lib/api/public-test-definition'
import {
    authorizeTrackingRequest,
    getOptionalAllowedOrigin,
    jsonResponse,
} from '@/lib/api/tracking-route'
import { getTestByKey, getVariantsByTestId } from '@/lib/supabase/queries'

export const runtime = 'nodejs'

const TEST_ALLOWED_METHODS = 'GET, OPTIONS'

export async function GET(request: NextRequest) {
    const authResult = authorizeTrackingRequest(request, {
        allowedMethods: TEST_ALLOWED_METHODS,
        requireSecret: false,
    })

    if (authResult.response) {
        return authResult.response
    }

    const testKey = request.nextUrl.searchParams.get('test_key')?.trim()

    if (!testKey) {
        return jsonResponse(
            {
                success: false,
                message: 'test_key is required',
            },
            400,
            authResult.config.allowedOrigin,
            TEST_ALLOWED_METHODS,
        )
    }

    const test = await getTestByKey(testKey)

    if (!test) {
        return jsonResponse(
            {
                success: false,
                message: 'Test not found',
            },
            404,
            authResult.config.allowedOrigin,
            TEST_ALLOWED_METHODS,
        )
    }

    const variants = await getVariantsByTestId(test.id)
    const definition = buildPublicTestDefinition(test, variants)

    if (!definition) {
        return jsonResponse(
            {
                success: false,
                message: 'Active variants not found',
            },
            404,
            authResult.config.allowedOrigin,
            TEST_ALLOWED_METHODS,
        )
    }

    return jsonResponse(
        {
            success: true,
            data: definition,
        },
        200,
        authResult.config.allowedOrigin,
        TEST_ALLOWED_METHODS,
    )
}

export async function OPTIONS(request: NextRequest) {
    const authResult = authorizeTrackingRequest(request, {
        allowedMethods: TEST_ALLOWED_METHODS,
        requireSecret: false,
    })

    if (authResult.response) {
        return authResult.response
    }

    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': authResult.config.allowedOrigin ?? getOptionalAllowedOrigin() ?? '',
            'Access-Control-Allow-Headers': 'Content-Type, x-ab-track-secret',
            'Access-Control-Allow-Methods': TEST_ALLOWED_METHODS,
            'Access-Control-Allow-Credentials': 'true',
            Vary: 'Origin',
        },
    })
}
