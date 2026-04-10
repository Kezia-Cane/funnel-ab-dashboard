import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAdmin } from "../../../lib/supabase-admin";

export const runtime = "nodejs";

type TrackEventType = "page_view" | "cta_click" | "purchase";

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

const ALLOWED_EVENTS: TrackEventType[] = [
  "page_view",
  "cta_click",
  "purchase",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function jsonResponse(
  body: { success: boolean; message: string },
  status: number
) {
  return NextResponse.json(body, {
    status,
    headers: corsHeaders,
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

  if (!ALLOWED_EVENTS.includes(event as TrackEventType)) {
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

export async function GET() {
  return jsonResponse(
    {
      success: true,
      message: "A/B tracking API is healthy",
    },
    200
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      {
        success: false,
        message: "Invalid JSON payload",
      },
      400
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
      500
    );
  }

  const parsed = parsePayload(body);

  if (parsed.error) {
    return jsonResponse(
      {
        success: false,
        message: parsed.error,
      },
      400
    );
  }

  const payload = parsed.data;

  if (!payload) {
    return jsonResponse(
      {
        success: false,
        message: "Invalid tracking payload",
      },
      400
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
      500
    );
  }

  if (!test) {
    return jsonResponse(
      {
        success: false,
        message: "Test not found",
      },
      404
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
      500
    );
  }

  if (!variant) {
    return jsonResponse(
      {
        success: false,
        message: "Variant not found",
      },
      404
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
      500
    );
  }

  return jsonResponse(
    {
      success: true,
      message: "Tracking event received",
    },
    200
  );
}
