import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { TRACK_EVENT_TYPES, type TrackEventType } from "@/types";

export const runtime = "nodejs";

type TrackPayload = {
  event: TrackEventType;
  test_key: string;
  variant: string;
  page_url: string;
  page_path: string;
  timestamp: string;
  user_agent?: string;
  revenue_value?: number;
  metadata?: Record<string, unknown>;
};

const ALLOWED_EVENTS = new Set<TrackEventType>(TRACK_EVENT_TYPES);

const CORS_ALLOWED_HEADERS = "Content-Type, x-ab-track-secret";
const CORS_ALLOWED_METHODS = "GET, POST, OPTIONS";

type JsonResponseBody = {
  success: boolean;
  message: string;
};

type TrackingApiConfig = {
  allowedOrigin: string;
  apiSecret: string;
};

function getRequiredEnv(
  name: "ALLOWED_AB_ORIGIN" | "AB_TRACK_API_SECRET"
): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function getTrackingApiConfig(): TrackingApiConfig {
  return {
    allowedOrigin: getRequiredEnv("ALLOWED_AB_ORIGIN"),
    apiSecret: getRequiredEnv("AB_TRACK_API_SECRET"),
  };
}

function getOptionalAllowedOrigin(): string | undefined {
  const allowedOrigin = process.env.ALLOWED_AB_ORIGIN?.trim();
  return allowedOrigin || undefined;
}

function getCorsHeaders(allowedOrigin?: string) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": CORS_ALLOWED_HEADERS,
    "Access-Control-Allow-Methods": CORS_ALLOWED_METHODS,
    Vary: "Origin",
  };

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }

  return headers;
}

function jsonResponse(
  body: JsonResponseBody,
  status: number,
  allowedOrigin?: string
) {
  return NextResponse.json(body, {
    status,
    headers: getCorsHeaders(allowedOrigin),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePayload(body: unknown):
  | { data: TrackPayload; error: null }
  | { data: null; error: string } {
  if (!isRecord(body)) {
    return { data: null, error: "Invalid JSON payload" };
  }

  const event = body.event;
  const testKey = body.test_key;
  const variant = body.variant;
  const pageUrl = body.page_url;
  const pagePath = body.page_path;
  const timestamp = body.timestamp;
  const userAgent = body.user_agent;
  const revenueValue = body.revenue_value;
  const metadata = body.metadata;

  if (
    typeof event !== "string" ||
    typeof testKey !== "string" ||
    typeof variant !== "string" ||
    typeof pageUrl !== "string" ||
    typeof pagePath !== "string" ||
    typeof timestamp !== "string"
  ) {
    return { data: null, error: "Missing or invalid required fields" };
  }

  if (!ALLOWED_EVENTS.has(event as TrackEventType)) {
    return { data: null, error: "Invalid event type" };
  }

  const normalizedTestKey = testKey.trim();
  const normalizedVariant = variant.trim().toUpperCase();
  const normalizedPageUrl = pageUrl.trim();
  const normalizedPagePath = pagePath.trim();
  const normalizedTimestamp = timestamp.trim();

  if (!normalizedVariant) {
    return { data: null, error: "Variant is required" };
  }

  if (
    !normalizedTestKey ||
    !normalizedPageUrl ||
    !normalizedPagePath ||
    !normalizedTimestamp
  ) {
    return { data: null, error: "Missing or invalid required fields" };
  }

  if (Number.isNaN(Date.parse(normalizedTimestamp))) {
    return { data: null, error: "Invalid timestamp" };
  }

  if (
    userAgent !== undefined &&
    userAgent !== null &&
    typeof userAgent !== "string"
  ) {
    return { data: null, error: "Invalid user_agent" };
  }

  if (
    revenueValue !== undefined &&
    revenueValue !== null &&
    (typeof revenueValue !== "number" || !Number.isFinite(revenueValue))
  ) {
    return { data: null, error: "Invalid revenue_value" };
  }

  if (metadata !== undefined && metadata !== null && !isRecord(metadata)) {
    return { data: null, error: "Invalid metadata" };
  }

  return {
    data: {
      event: event as TrackEventType,
      test_key: normalizedTestKey,
      variant: normalizedVariant,
      page_url: normalizedPageUrl,
      page_path: normalizedPagePath,
      timestamp: normalizedTimestamp,
      user_agent:
        typeof userAgent === "string" && userAgent.trim()
          ? userAgent.trim()
          : undefined,
      revenue_value:
        typeof revenueValue === "number" ? revenueValue : undefined,
      metadata: isRecord(metadata) ? metadata : undefined,
    },
    error: null,
  };
}

function configErrorResponse(error: unknown) {
  return jsonResponse(
    {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Tracking API configuration is invalid",
    },
    500,
    getOptionalAllowedOrigin()
  );
}

function originErrorResponse(request: NextRequest, allowedOrigin: string) {
  const requestOrigin = request.headers.get("origin");

  if (requestOrigin && requestOrigin !== allowedOrigin) {
    return jsonResponse(
      {
        success: false,
        message: "Origin not allowed",
      },
      403,
      allowedOrigin
    );
  }

  return null;
}

export async function GET() {
  return jsonResponse(
    {
      success: true,
      message: "A/B tracking API is healthy",
    },
    200,
    getOptionalAllowedOrigin()
  );
}

export async function OPTIONS(request: NextRequest) {
  let config: TrackingApiConfig;

  try {
    config = getTrackingApiConfig();
  } catch (error) {
    return configErrorResponse(error);
  }

  const invalidOriginResponse = originErrorResponse(
    request,
    config.allowedOrigin
  );

  if (invalidOriginResponse) {
    return invalidOriginResponse;
  }

  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(config.allowedOrigin),
  });
}

export async function POST(request: NextRequest) {
  let config: TrackingApiConfig;

  try {
    config = getTrackingApiConfig();
  } catch (error) {
    return configErrorResponse(error);
  }

  const invalidOriginResponse = originErrorResponse(request, config.allowedOrigin);

  if (invalidOriginResponse) {
    return invalidOriginResponse;
  }

  const requestSecret = request.headers.get("x-ab-track-secret")?.trim();

  if (!requestSecret || requestSecret !== config.apiSecret) {
    return jsonResponse(
      {
        success: false,
        message: "Unauthorized",
      },
      401,
      config.allowedOrigin
    );
  }

  let supabaseAdmin: SupabaseClient;

  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Supabase admin is not configured",
      },
      500,
      config.allowedOrigin
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      {
        success: false,
        message: "Invalid JSON payload",
      },
      400,
      config.allowedOrigin
    );
  }

  const parsed = parsePayload(body);

  if (parsed.error) {
    return jsonResponse(
      {
        success: false,
        message: parsed.error,
      },
      400,
      config.allowedOrigin
    );
  }

  const payload = parsed.data;

  if (!payload) {
    return jsonResponse(
      {
        success: false,
        message: "Invalid tracking payload",
      },
      400,
      config.allowedOrigin
    );
  }

  const { data: test, error: testError } = await supabaseAdmin
    .from("ab_tests")
    .select("id")
    .eq("test_key", payload.test_key)
    .maybeSingle();

  if (testError) {
    return jsonResponse(
      {
        success: false,
        message: "Failed to resolve test",
      },
      500,
      config.allowedOrigin
    );
  }

  if (!test) {
    return jsonResponse(
      {
        success: false,
        message: "Test not found",
      },
      404,
      config.allowedOrigin
    );
  }

  const { data: variant, error: variantError } = await supabaseAdmin
    .from("ab_variants")
    .select("id")
    .eq("test_id", test.id)
    .eq("variant_key", payload.variant)
    .maybeSingle();

  if (variantError) {
    return jsonResponse(
      {
        success: false,
        message: "Failed to resolve variant",
      },
      500,
      config.allowedOrigin
    );
  }

  if (!variant) {
    return jsonResponse(
      {
        success: false,
        message: "Variant not found",
      },
      404,
      config.allowedOrigin
    );
  }

  const { error: insertError } = await supabaseAdmin.from("ab_events").insert({
    test_id: test.id,
    variant_id: variant.id,
    event_type: payload.event,
    page_url: payload.page_url,
    page_path: payload.page_path,
    user_agent: payload.user_agent ?? null,
    revenue_value: payload.revenue_value ?? null,
    metadata: payload.metadata ?? null,
    created_at: payload.timestamp,
  });

  if (insertError) {
    return jsonResponse(
      {
        success: false,
        message: "Failed to store tracking event",
      },
      500,
      config.allowedOrigin
    );
  }

  return jsonResponse(
    {
      success: true,
      message: "Tracking event received",
    },
    200,
    config.allowedOrigin
  );
}
