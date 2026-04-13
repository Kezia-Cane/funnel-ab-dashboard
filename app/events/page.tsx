import type { Metadata } from 'next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopNav from '@/components/layout/TopNav'
import { getEventsSince, getRecentEventFeed, getTests, getVariantsByTestId } from '@/lib/supabase/queries'
import { TRACK_EVENT_TYPES } from '@/types'

export const metadata: Metadata = { title: 'Event Logs' }

export const dynamic = 'force-dynamic'

const EVENT_COLORS: Record<string, string> = {
    page_view: 'text-blue-600 bg-blue-50',
    cta_click: 'text-emerald-600 bg-emerald-50',
    purchase: 'text-purple-600 bg-purple-50',
}

const LIVE_DOT_COLORS: Record<string, string> = {
    live: 'bg-primary',
    logged: 'bg-outline-variant',
}

function formatTimestamp(value: string) {
    return new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
}

function getDisplayPath(pagePath?: string, pageUrl?: string) {
    if (pagePath) return pagePath

    if (!pageUrl) return '—'

    try {
        return new URL(pageUrl).pathname
    } catch {
        return pageUrl
    }
}

export default async function EventLogsPage() {
    const last24Hours = new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString()

    const [events, events24h, tests] = await Promise.all([
        getRecentEventFeed(50),
        getEventsSince(last24Hours, undefined, 5_000),
        getTests(),
    ])

    const variantsByTest = await Promise.all(tests.map((test) => getVariantsByTestId(test.id)))
    const variantKeys = [...new Set(variantsByTest.flat().map((variant) => variant.variant_key))].sort()

    const totalEvents24h = events24h.length
    const pageViews24h = events24h.filter((event) => event.event_type === 'page_view').length
    const ctaClicks24h = events24h.filter((event) => event.event_type === 'cta_click').length
    const latestEvent = events[0]
    const schemaPreview = latestEvent
        ? JSON.stringify({
            event: latestEvent.event_type,
            test_name: latestEvent.test_name,
            variant: latestEvent.variant_key,
            page_url: latestEvent.page_url ?? null,
            page_path: latestEvent.page_path ?? null,
            timestamp: latestEvent.created_at,
        }, null, 2)
        : JSON.stringify({
            message: 'No events in Supabase yet.',
        }, null, 2)

    return (
        <DashboardLayout>
            <TopNav
                title="Precision Layered Dashboard"
                searchPlaceholder="Search events, paths, or variants..."
                rightContent={
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-semibold text-sm hover:bg-surface-container transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>api</span>
                        API Docs
                    </button>
                }
            />

            <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">Event Logs</h1>
                        <p className="text-on-surface-variant mt-1 text-lg">
                            Live Supabase telemetry from your deployed A/B tests.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="btn-primary px-4 py-2 text-sm font-semibold">Live View</button>
                        <button className="btn-secondary px-4 py-2 text-sm font-semibold">Latest 24H</button>
                        <button className="btn-secondary px-4 py-2 text-sm font-semibold flex items-center gap-1.5">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                            Export CSV
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Events (24H)', value: totalEvents24h.toLocaleString(), sub: `${tests.length} tests`, subColor: 'text-on-surface-variant' },
                        { label: 'Page Views (24H)', value: pageViews24h.toLocaleString(), sub: 'Live tracked', subColor: 'text-emerald-600' },
                        { label: 'CTA Clicks (24H)', value: ctaClicks24h.toLocaleString(), sub: 'Live tracked', subColor: 'text-emerald-600' },
                        { label: 'Tracked Variants', value: variantKeys.length.toLocaleString(), sub: 'Across Supabase', subColor: 'text-on-surface-variant' },
                    ].map((kpi) => (
                        <div key={kpi.label} className="card p-6">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">{kpi.label}</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-extrabold text-on-surface font-headline">{kpi.value}</p>
                                <span className={`text-xs font-bold ${kpi.subColor}`}>{kpi.sub}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card p-6">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div>
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Event Type</label>
                            <select className="pl-4 pr-8 py-2 bg-surface-container-low rounded-xl text-sm text-on-surface font-medium border-0 outline-none focus:ring-2 focus:ring-primary/20">
                                <option>All Events</option>
                                {TRACK_EVENT_TYPES.map((eventType) => (
                                    <option key={eventType}>{eventType}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Variant</label>
                            <select className="pl-4 pr-8 py-2 bg-surface-container-low rounded-xl text-sm text-on-surface font-medium border-0 outline-none focus:ring-2 focus:ring-primary/20">
                                <option>All Variants</option>
                                {variantKeys.map((variantKey) => (
                                    <option key={variantKey}>Variant {variantKey}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Date Range</label>
                            <button className="flex items-center gap-2 pl-4 pr-5 py-2 bg-surface-container-low rounded-xl text-sm text-on-surface font-medium">
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_month</span>
                                Last 24 Hours
                            </button>
                        </div>

                        <button className="ml-auto text-primary font-semibold text-sm hover:opacity-70 transition-opacity self-end pb-2">
                            Clear Filters
                        </button>
                    </div>

                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest border-b border-surface-container-low">
                                <th className="pb-3 pr-6">Event Type</th>
                                <th className="pb-3 pr-6">Test / Variant</th>
                                <th className="pb-3 pr-6">Page Path</th>
                                <th className="pb-3 pr-6">Timestamp</th>
                                <th className="pb-3">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container-low">
                            {events.length ? events.map((event) => (
                                <tr key={event.id} className="hover:bg-surface-container-low/20 transition-colors">
                                    <td className="py-4 pr-6">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${LIVE_DOT_COLORS[event.status]}`} />
                                            <span
                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${EVENT_COLORS[event.event_type] ?? 'text-on-surface-variant bg-surface-container-high'}`}
                                            >
                                                {event.event_type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 pr-6">
                                        <div>
                                            <p className="text-sm font-semibold text-on-surface">{event.test_name}</p>
                                            <span className="inline-flex mt-1 px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-semibold">
                                                Variant {event.variant_key}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 pr-6 text-sm font-mono text-on-surface-variant">
                                        {getDisplayPath(event.page_path, event.page_url)}
                                    </td>
                                    <td className="py-4 pr-6 text-sm font-mono text-on-surface-variant">{formatTimestamp(event.created_at)}</td>
                                    <td className="py-4">
                                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors">
                                            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '16px' }}>chevron_right</span>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-sm text-on-surface-variant">
                                        No Supabase events yet. New page views and CTA clicks will show up here automatically.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-surface-container-low">
                        <p className="text-sm text-on-surface-variant">
                            Showing <span className="font-bold text-on-surface">{events.length}</span> recent events from Supabase
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-2xl bg-[#1a1f2e] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="w-3 h-3 rounded-full bg-amber-400" />
                            <span className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="ml-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Latest Event Payload</span>
                        </div>
                        <pre className="text-xs text-slate-300 font-mono leading-relaxed overflow-x-auto">
                            {schemaPreview}
                        </pre>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-container p-6 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white font-headline mb-2">Automate with Webhooks</h3>
                            <p className="text-white/70 text-sm leading-relaxed">
                                Stream these live Supabase events directly to your backend, Slack, or CRM as they land.
                            </p>
                        </div>
                        <button className="mt-6 w-full py-3 bg-white text-primary font-bold rounded-xl text-sm hover:bg-white/90 transition-colors">
                            Connect Webhook
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
