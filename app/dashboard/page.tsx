import type { Metadata } from 'next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopNav from '@/components/layout/TopNav'
import KpiCard from '@/components/dashboard/KpiCard'
import ConversionChart from '@/components/dashboard/ConversionChart'
import VariantTable from '@/components/dashboard/VariantTable'
import FunnelView from '@/components/dashboard/FunnelView'
import StatisticalSignificance from '@/components/dashboard/StatisticalSignificance'
import RecentEvents from '@/components/dashboard/RecentEvents'
import {
    getDashboardKPIs,
    getDailyCtrChartData,
    getRecentActivity,
    getTests,
    getVariantStats,
} from '@/lib/supabase/queries'

export const metadata: Metadata = {
    title: 'Dashboard',
}

export const dynamic = 'force-dynamic'

const EMPTY_KPIS = {
    total_visitors: 0,
    total_clicks: 0,
    total_purchases: 0,
    conversion_rate: 0,
    purchase_conversion_rate: 0,
    leader_variant: '—',
    leader_metric: 'ctr' as const,
    confidence_level: 0,
}

export default async function DashboardPage() {
    const tests = await getTests()
    const test = tests.find((item) => item.status === 'active') ?? tests[0] ?? null

    const [kpis, variants, events, chartData] = test
        ? await Promise.all([
            getDashboardKPIs(test.id),
            getVariantStats(test.id),
            getRecentActivity(5, test.id),
            getDailyCtrChartData(test.id),
        ])
        : [EMPTY_KPIS, [], [], []]

    const leader = variants.find((variant) => variant.is_leader)
    const leaderLabel = leader ? `Variant ${leader.variant_key}` : 'Awaiting traffic'
    const leaderBadge = kpis.confidence_level > 0
        ? `${kpis.confidence_level.toFixed(1)}% CONFIDENCE`
        : 'LIVE CTR'
    const significanceInsight = leader
        ? `${leaderLabel} currently leads on CTA click-through rate with ${leader.clicks.toLocaleString()} clicks from ${leader.visitors.toLocaleString()} live page views.`
        : 'Live significance will appear once page views and CTA clicks have accumulated for multiple variants.'

    return (
        <DashboardLayout>
            <TopNav
                title="Precision Layered Dashboard"
                activeTest={test?.name}
                rightContent={
                    <div className="flex gap-3">
                        <button className="btn-secondary px-5 py-2 text-sm font-semibold">
                            {test?.status === 'active' ? 'Pause Test' : 'Review Test'}
                        </button>
                        <button className="bg-gradient-to-br from-primary to-primary-container text-white font-semibold px-5 py-2 rounded-xl text-sm ambient-shadow-primary hover:opacity-90 transition-opacity">
                            {leader ? `Deploy Variant ${leader.variant_key}` : 'Awaiting Leader'}
                        </button>
                    </div>
                }
            />

            <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-end flex-wrap gap-4">
                    <div>
                        {test ? (
                            <div className="flex items-center gap-3 mb-2">
                                <span className="badge-active">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                                </span>
                                <span className="text-on-surface-variant text-sm font-medium">
                                    Started {new Date(test.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                        ) : null}
                        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">
                            {test?.name ?? 'No live tests yet'}
                        </h1>
                        <p className="text-on-surface-variant mt-1 text-lg">
                            {test?.description ?? 'As soon as an A/B test and event stream exist in Supabase, the live dashboard will populate here.'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    <KpiCard
                        icon="group"
                        iconBg="bg-blue-50"
                        iconColor="text-blue-600"
                        label="Total Page Views"
                        value={kpis.total_visitors.toLocaleString()}
                    />
                    <KpiCard
                        icon="ads_click"
                        iconBg="bg-emerald-50"
                        iconColor="text-emerald-600"
                        label="Total CTA Clicks"
                        value={kpis.total_clicks.toLocaleString()}
                    />
                    <KpiCard
                        icon="insights"
                        iconBg="bg-purple-50"
                        iconColor="text-purple-600"
                        label="CTA Click Rate"
                        value={`${kpis.conversion_rate.toFixed(1)}%`}
                    />

                    <div className="relative overflow-hidden rounded-2xl bg-primary text-white p-6 ambient-shadow-primary group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    <span className="material-symbols-outlined material-symbols-filled" style={{ fontSize: '22px' }}>
                                        emoji_events
                                    </span>
                                </div>
                                <span className="text-white/90 text-[10px] font-bold bg-white/20 px-2 py-1 rounded-lg backdrop-blur-md tracking-wide">
                                    {leaderBadge}
                                </span>
                            </div>
                            <p className="text-white/70 text-sm font-medium">Current Leader by CTR</p>
                            <p className="text-3xl font-extrabold mt-1 font-headline">{leaderLabel}</p>
                        </div>
                        <div className="absolute top-0 right-0 p-8 translate-x-4 -translate-y-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                            <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>stars</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <ConversionChart data={chartData} />
                        <FunnelView variants={variants} />
                        <VariantTable variants={variants} />
                    </div>

                    <div className="space-y-6">
                        <StatisticalSignificance
                            confidence={kpis.confidence_level}
                            leaderVariant={leaderLabel}
                            insight={significanceInsight}
                        />
                        <RecentEvents events={events} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
