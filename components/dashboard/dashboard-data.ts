import type { DashboardKPIs } from '@/types'

export const EMPTY_DASHBOARD_KPIS: DashboardKPIs = {
    total_visitors: 0,
    total_clicks: 0,
    total_purchases: 0,
    conversion_rate: 0,
    purchase_conversion_rate: 0,
    leader_variant: '—',
    leader_metric: 'ctr',
    confidence_level: 0,
}
