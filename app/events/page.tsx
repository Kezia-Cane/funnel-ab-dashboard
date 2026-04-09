import type { Metadata } from 'next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopNav from '@/components/layout/TopNav'
import { SAMPLE_EVENTS } from '@/lib/sample-data'

export const metadata: Metadata = { title: 'Event Logs' }

const EVENT_COLORS: Record<string, string> = {
    page_view: 'text-blue-600 bg-blue-50',
    cta_click: 'text-emerald-600 bg-emerald-50',
    conversion: 'text-amber-600 bg-amber-50',
    purchase: 'text-purple-600 bg-purple-50',
    form_submit: 'text-orange-600 bg-orange-50',
}

const LIVE_DOT_COLORS: Record<string, string> = {
    live: 'bg-primary',
    logged: 'bg-outline-variant',
    warn: 'bg-amber-400',
}

export default function EventLogsPage() {
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
                {/* Header */}
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">Event Logs</h1>
                        <p className="text-on-surface-variant mt-1 text-lg">
                            Real-time stream of incoming telemetry from your deployed funnels.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="btn-primary px-4 py-2 text-sm font-semibold">Live View</button>
                        <button className="btn-secondary px-4 py-2 text-sm font-semibold">Historical</button>
                        <button className="btn-secondary px-4 py-2 text-sm font-semibold flex items-center gap-1.5">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Events (24H)', value: '128.4k', sub: '+12.4%', subColor: 'text-emerald-600' },
                        { label: 'Avg Latency', value: '42ms', sub: 'Stable', subColor: 'text-emerald-600' },
                        { label: 'Error Rate', value: '0.04%', sub: '-0.01%', subColor: 'text-emerald-600' },
                        { label: 'Active Variants', value: '14', sub: 'Across 4 tests', subColor: 'text-on-surface-variant' },
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

                {/* Filters */}
                <div className="card p-6">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        {/* Event Type Filter */}
                        <div>
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Event Type</label>
                            <select className="pl-4 pr-8 py-2 bg-surface-container-low rounded-xl text-sm text-on-surface font-medium border-0 outline-none focus:ring-2 focus:ring-primary/20">
                                <option>All Events</option>
                                <option>page_view</option>
                                <option>cta_click</option>
                                <option>conversion</option>
                                <option>purchase</option>
                            </select>
                        </div>

                        {/* Variant Filter */}
                        <div>
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Variant</label>
                            <select className="pl-4 pr-8 py-2 bg-surface-container-low rounded-xl text-sm text-on-surface font-medium border-0 outline-none focus:ring-2 focus:ring-primary/20">
                                <option>All Variants</option>
                                <option>Variant A</option>
                                <option>Variant B</option>
                                <option>Variant C</option>
                            </select>
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Date Range</label>
                            <button className="flex items-center gap-2 pl-4 pr-5 py-2 bg-surface-container-low rounded-xl text-sm text-on-surface font-medium">
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_month</span>
                                Last 60 Minutes
                            </button>
                        </div>

                        <button className="ml-auto text-primary font-semibold text-sm hover:opacity-70 transition-opacity self-end pb-2">
                            Clear Filters
                        </button>
                    </div>

                    {/* Events Table */}
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest border-b border-surface-container-low">
                                <th className="pb-3 pr-6">Event Type</th>
                                <th className="pb-3 pr-6">Variant</th>
                                <th className="pb-3 pr-6">Page Path</th>
                                <th className="pb-3 pr-6">Timestamp</th>
                                <th className="pb-3">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container-low">
                            {SAMPLE_EVENTS.map((event) => (
                                <tr key={event.id} className="hover:bg-surface-container-low/20 transition-colors">
                                    <td className="py-4 pr-6">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${LIVE_DOT_COLORS[event.status]}`} />
                                            <span
                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${EVENT_COLORS[event.event_type] ?? 'text-on-surface-variant bg-surface-container-high'
                                                    }`}
                                            >
                                                {event.event_type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 pr-6">
                                        <span className="px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-semibold">
                                            {event.variant}
                                        </span>
                                    </td>
                                    <td className="py-4 pr-6 text-sm font-mono text-on-surface-variant">{event.page_path}</td>
                                    <td className="py-4 pr-6 text-sm font-mono text-on-surface-variant">{event.timestamp}</td>
                                    <td className="py-4">
                                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors">
                                            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '16px' }}>chevron_right</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-surface-container-low">
                        <p className="text-sm text-on-surface-variant">
                            Showing <span className="font-bold text-on-surface">50</span> of 12,842 events
                        </p>
                        <div className="flex items-center gap-2">
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors">
                                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>chevron_left</span>
                            </button>
                            {[1, 2, 3].map((page) => (
                                <button
                                    key={page}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${page === 1
                                        ? 'bg-primary text-white'
                                        : 'hover:bg-surface-container-high text-on-surface-variant'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors">
                                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom info cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Schema Inspector */}
                    <div className="rounded-2xl bg-[#1a1f2e] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="w-3 h-3 rounded-full bg-amber-400" />
                            <span className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="ml-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schema Inspector</span>
                        </div>
                        <pre className="text-xs text-slate-300 font-mono leading-relaxed overflow-x-auto">
                            {`{
  "event": "purchase",
  "test_key": "nad_headline_test_v1",
  "variant": "B",
  "page_url": "https://example.com/checkout/success",
  "page_path": "/checkout/success",
  "revenue_value": 97.00,
  "timestamp": "2026-04-07T10:00:00.000Z",
  "user_agent": "Mozilla/5.0..."
}`}
                        </pre>
                    </div>

                    {/* Webhook CTA */}
                    <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-container p-6 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white font-headline mb-2">Automate with Webhooks</h3>
                            <p className="text-white/70 text-sm leading-relaxed">
                                Stream these events directly to your backend, Slack, or CRM in real-time with zero latency.
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
