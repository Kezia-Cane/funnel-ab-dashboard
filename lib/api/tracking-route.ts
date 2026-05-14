import { NextRequest, NextResponse } from 'next/server'
import { parseAllowedOrigins } from '@/lib/api/tracking-policy'

const CORS_ALLOWED_HEADERS = 'Content-Type, x-ab-track-secret'

export type JsonResponseBody = {
    success: boolean
    message: string
}

export type TrackingApiConfig = {
    allowedOrigin?: string
    allowedOrigins: string[]
    apiSecret: string
}

type TrackingRouteOptions = {
    allowedMethods?: string
    requireSecret?: boolean
}

function getRequiredEnv(name: 'ALLOWED_AB_ORIGIN' | 'AB_TRACK_API_SECRET'): string {
    const value = process.env[name]?.trim()

    if (!value) {
        throw new Error(`Missing environment variable: ${name}`)
    }

    return value
}

function getRequiredAllowedOrigins(): string[] {
    const rawValue =
        process.env.ALLOWED_AB_ORIGINS?.trim() ||
        process.env.ALLOWED_AB_ORIGIN?.trim()

    if (!rawValue) {
        throw new Error('Missing environment variable: ALLOWED_AB_ORIGIN')
    }

    const origins = parseAllowedOrigins(rawValue)

    if (!origins.length) {
        throw new Error('At least one allowed origin is required')
    }

    return origins
}

export function getTrackingApiConfig(): TrackingApiConfig {
    const allowedOrigins = getRequiredAllowedOrigins()

    return {
        allowedOrigin: allowedOrigins[0],
        allowedOrigins,
        apiSecret: getRequiredEnv('AB_TRACK_API_SECRET'),
    }
}

export function getOptionalAllowedOrigin(): string | undefined {
    const rawValue =
        process.env.ALLOWED_AB_ORIGINS?.trim() ||
        process.env.ALLOWED_AB_ORIGIN?.trim()

    if (!rawValue) {
        return undefined
    }

    return parseAllowedOrigins(rawValue)[0]
}

export function getCorsHeaders(allowedOrigin?: string, allowedMethods = 'POST'): Record<string, string> {
    const headers: Record<string, string> = {
        'Access-Control-Allow-Headers': CORS_ALLOWED_HEADERS,
        'Access-Control-Allow-Methods': allowedMethods,
        'Access-Control-Allow-Credentials': 'true',
        Vary: 'Origin',
    }

    if (allowedOrigin) {
        headers['Access-Control-Allow-Origin'] = allowedOrigin
    }

    return headers
}

export function jsonResponse(
    body: JsonResponseBody,
    status: number,
    allowedOrigin?: string,
    allowedMethods = 'POST',
) {
    return NextResponse.json(body, {
        status,
        headers: getCorsHeaders(allowedOrigin, allowedMethods),
    })
}

export function methodNotAllowedResponse(allowedMethods = 'POST', allowedOrigin = getOptionalAllowedOrigin()) {
    return jsonResponse(
        {
            success: false,
            message: 'Method not allowed',
        },
        405,
        allowedOrigin,
        allowedMethods,
    )
}

export function configErrorResponse(error: unknown, allowedMethods = 'POST') {
    return jsonResponse(
        {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Tracking API configuration is invalid',
        },
        500,
        getOptionalAllowedOrigin(),
        allowedMethods,
    )
}

export function originErrorResponse(
    request: NextRequest,
    allowedOrigins: string[],
    allowedMethods = 'POST',
) {
    const requestOrigin = request.headers.get('origin')

    if (requestOrigin && !allowedOrigins.includes(requestOrigin)) {
        return jsonResponse(
            {
                success: false,
                message: 'Origin not allowed',
            },
            403,
            allowedOrigins[0],
            allowedMethods,
        )
    }

    return null
}

export function authorizeTrackingRequest(
    request: NextRequest,
    { allowedMethods = 'POST', requireSecret = true }: TrackingRouteOptions = {},
):
    | { config: TrackingApiConfig; response: null }
    | { config: null; response: NextResponse } {
    let config: TrackingApiConfig

    try {
        config = getTrackingApiConfig()
    } catch (error) {
        return {
            config: null,
            response: configErrorResponse(error, allowedMethods),
        }
    }

    const invalidOriginResponse = originErrorResponse(request, config.allowedOrigins, allowedMethods)

    if (invalidOriginResponse) {
        return {
            config: null,
            response: invalidOriginResponse,
        }
    }

    const requestOrigin = request.headers.get('origin')
    const allowedOrigin =
        requestOrigin && config.allowedOrigins.includes(requestOrigin)
            ? requestOrigin
            : config.allowedOrigins[0]

    if (!requireSecret) {
        return {
            config: {
                ...config,
                allowedOrigin,
            },
            response: null,
        }
    }

    const requestSecret = request.headers.get('x-ab-track-secret')?.trim()

    if (!requestSecret || requestSecret !== config.apiSecret) {
        return {
            config: null,
            response: jsonResponse(
                {
                    success: false,
                    message: 'Unauthorized',
                },
                401,
                config.allowedOrigin,
                allowedMethods,
            ),
        }
    }

    return { config, response: null }
}

export async function readJsonRequest(
    request: NextRequest,
    allowedOrigin?: string,
    allowedMethods = 'POST',
): Promise<
    | { body: unknown; response: null }
    | { body: null; response: NextResponse }
> {
    try {
        return {
            body: await request.json(),
            response: null,
        }
    } catch {
        return {
            body: null,
            response: jsonResponse(
                {
                    success: false,
                    message: 'Invalid JSON payload',
                },
                400,
                allowedOrigin,
                allowedMethods,
            ),
        }
    }
}

export function insertEventErrorResponse(
    error: unknown,
    allowedOrigin?: string,
    allowedMethods = 'POST',
) {
    const message = error instanceof Error ? error.message : 'Failed to store tracking event'

    if (message.startsWith('Test not found:')) {
        return jsonResponse(
            {
                success: false,
                message: 'Test not found',
            },
            404,
            allowedOrigin,
            allowedMethods,
        )
    }

    if (message.startsWith('Variant not found:')) {
        return jsonResponse(
            {
                success: false,
                message: 'Variant not found',
            },
            404,
            allowedOrigin,
            allowedMethods,
        )
    }

    return jsonResponse(
        {
            success: false,
            message: 'Failed to store tracking event',
        },
        500,
        allowedOrigin,
        allowedMethods,
    )
}
