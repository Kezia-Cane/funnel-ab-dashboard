// ====================
// Core Database Types
// ====================

export type TestStatus = 'active' | 'completed' | 'draft' | 'paused'
export const TRACK_EVENT_TYPES = ['page_view', 'cta_click', 'purchase'] as const
export type TrackEventType = typeof TRACK_EVENT_TYPES[number]
export type EventType = TrackEventType

export interface ABTest {
    id: string
    name: string
    test_key: string
    description?: string
    status: TestStatus
    created_at: string
    updated_at?: string
}

export interface ABVariant {
    id: string
    test_id: string
    variant_key: string // 'A', 'B', 'C'
    headline: string
    subheadline?: string
    is_control: boolean
    created_at: string
}

export interface ABEvent {
    id: string
    test_id: string
    variant_id: string
    event_type: EventType
    page_url?: string
    page_path?: string
    user_agent?: string
    revenue_value?: number
    metadata?: Record<string, unknown>
    created_at: string
}

// ====================
// Tracking Payload (from GHL funnel)
// ====================

export interface TrackingPayload {
    event: TrackEventType
    test_key: string
    variant: string // 'A', 'B', 'C'
    page_url: string
    page_path: string
    timestamp: string
    user_agent?: string
    revenue_value?: number
    metadata?: Record<string, unknown>
}

// ====================
// Dashboard / Analytics Types
// ====================

export interface VariantStats {
    variant_key: string
    headline: string
    is_control: boolean
    is_leader: boolean
    visitors: number
    clicks: number
    ctr: number // click-through rate as percentage
    conversions: number
    conversion_rate: number // as percentage
    purchases: number
    purchase_conversion_rate: number // purchase / visitors
    lift?: number // % lift vs control
}

export interface DashboardKPIs {
    total_visitors: number
    total_clicks: number
    total_purchases: number
    conversion_rate: number
    purchase_conversion_rate: number
    leader_variant: string
    leader_metric: 'purchase' | 'ctr'
    confidence_level: number
}

export interface ChartDataPoint {
    date: string
    [key: string]: string | number
}

export interface RecentEvent {
    id: string
    title: string
    description: string
    time_ago: string
    type: 'success' | 'info' | 'warning'
}

// ====================
// API Response Types
// ====================

export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface TrackEventResponse {
    received: boolean
    event_id?: string
    timestamp: string
}

// ====================
// Validation Error Shape
// ====================

export interface ValidationError {
    field: string
    message: string
}
