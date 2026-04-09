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
    SAMPLE_KPIS,
    SAMPLE_VARIANT_STATS,
    SAMPLE_RECENT_EVENTS,
    SAMPLE_TEST,
} from '@/lib/sample-data'

export const metadata: Metadata = {
    title: 'Dashboard',
}

export default function DashboardPage() {
    const kpis = SAMPLE_KPIS
    const variants = SAMPLE_VARIANT_STATS
    const events = SAMPLE_RECENT_EVENTS
    const test = SAMPLE_TEST

    return (
        <DashboardLayout>
            <TopNav
                title="Precision Layered Dashboard"
                activeTest={test.name}
                rightContent={
                    <div className="flex gap-3">
                        <button className="btn-secondary px-5 py-2 text-sm font-semibold">
                            Pause Test
                        </button>
                        <button className="bg-gradient-to-br from-primary to-primary-container text-white font-semibold px-5 py-2 rounded-xl text-sm ambient-shadow-primary hover:opacity-90 transition-opacity">
                            Deploy Variant B
                        </button>
                    </div>
                }
            />

            <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
                {/* Page Header */}
                <div className="flex justify-between items-end flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="badge-active">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Active
                            </span>
                            <span className="text-on-surface-variant text-sm font-medium">
                                Started {new Date(test.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">
                            {test.name}
                        </h1>
                        <p className="text-on-surface-variant mt-1 text-lg">
                            {test.description ?? 'Optimizing landing page conversion via hero headline iteration.'}
                        </p>
                    </div>
                </div>

                {/* KPI Cards — Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    <KpiCard
                        icon="group"
                        iconBg="bg-blue-50"
                        iconColor="text-blue-600"
                        label="Total Visitors"
                        value={`${(kpis.total_visitors / 1000).toFixed(1)}k`}
                        trend="12%"
                        trendPositive
                    />
                    <KpiCard
                        icon="shopping_cart"
                        iconBg="bg-amber-50"
                        iconColor="text-amber-600"
                        label="Total Purchases"
                        value={`${kpis.total_purchases}`}
                        trend="15%"
                        trendPositive
                    />
                    <KpiCard
                        icon="payments"
                        iconBg="bg-purple-50"
                        iconColor="text-purple-600"
                        label="Purchase Conv. Rate"
                        value={`${kpis.purchase_conversion_rate}%`}
                        trend="1.2%"
                        trendPositive
                    />

                    {/* Leader Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-primary text-white p-6 ambient-shadow-primary group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    <span className="material-symbols-outlined material-symbols-filled" style={{ fontSize: '22px' }}>
                                        emoji_events
                                    </span>
                                </div>
                                <span className="text-white/90 text-[10px] font-bold bg-white/20 px-2 py-1 rounded-lg backdrop-blur-md tracking-wide">
                                    {kpis.confidence_level}% CONFIDENCE
                                </span>
                            </div>
                            <p className="text-white/70 text-sm font-medium">
                                {kpis.leader_metric === 'purchase' ? 'Leader by Purchase CV' : 'Temporary Leader by CTR'}
                            </p>
                            <p className="text-3xl font-extrabold mt-1 font-headline">Variant {kpis.leader_variant}</p>
                        </div>
                        {/* Decorative icon */}
                        <div className="absolute top-0 right-0 p-8 translate-x-4 -translate-y-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                            <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>stars</span>
                        </div>
                    </div>
                </div>

                {/* Main Content: Chart (2/3) + Sidebar (1/3) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Chart + Table */}
                    <div className="lg:col-span-2 space-y-6">
                        <ConversionChart />
                        <FunnelView variants={variants} />
                        <VariantTable variants={variants} />
                    </div>

                    {/* Right: Stats Sidebar */}
                    <div className="space-y-6">
                        <StatisticalSignificance
                            confidence={kpis.confidence_level}
                            leaderVariant={`Variant ${kpis.leader_variant}`}
                        />
                        <RecentEvents events={events} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
