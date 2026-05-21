'use client'

import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopNav from '@/components/layout/TopNav'
import KpiCard from '@/components/dashboard/KpiCard'
import ConversionChart from '@/components/dashboard/ConversionChart'
import VariantTable from '@/components/dashboard/VariantTable'
import FunnelView from '@/components/dashboard/FunnelView'
import StatisticalSignificance from '@/components/dashboard/StatisticalSignificance'
import RecentEvents from '@/components/dashboard/RecentEvents'
import type { ABTest, ChartDataPoint, DashboardKPIs, RecentEvent, VariantStats } from '@/types'

type DashboardExperienceProps = {
    connectedTest: ABTest | null
    connectedKpis: DashboardKPIs
    connectedVariants: VariantStats[]
    connectedEvents: RecentEvent[]
    connectedChartData: ChartDataPoint[]
    selectableFunnelNames: string[]
}

const EMPTY_KPIS: DashboardKPIs = {
    total_visitors: 0,
    total_clicks: 0,
    total_purchases: 0,
    conversion_rate: 0,
    purchase_conversion_rate: 0,
    leader_variant: '—',
    leader_metric: 'ctr',
    confidence_level: 0,
}

const SKELETON_SWITCH_DELAY_MS = 550

function DashboardSkeletonCard() {
    return (
        <div className="card p-6 animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high" />
                <div className="h-6 w-20 rounded-lg bg-surface-container-high" />
            </div>
            <div className="h-4 w-28 rounded bg-surface-container-high" />
            <div className="h-9 w-24 rounded bg-surface-container-high mt-3" />
        </div>
    )
}

function DashboardSkeletonPanel({ heightClass }: { heightClass: string }) {
    return (
        <div className={`card p-8 animate-pulse ${heightClass}`}>
            <div className="h-6 w-56 rounded bg-surface-container-high" />
            <div className="h-4 w-72 rounded bg-surface-container-high mt-3" />
            <div className="h-full rounded-2xl bg-surface-container-low/70 mt-6" />
        </div>
    )
}

export default function DashboardExperience({
    connectedTest,
    connectedKpis,
    connectedVariants,
    connectedEvents,
    connectedChartData,
    selectableFunnelNames,
}: DashboardExperienceProps) {
    const [selectedFunnel, setSelectedFunnel] = useState('')
    const [displayedFunnel, setDisplayedFunnel] = useState('')
    const [isSwitchingFunnel, setIsSwitchingFunnel] = useState(false)

    useEffect(() => {
        if (selectedFunnel === displayedFunnel) {
            return
        }

        setIsSwitchingFunnel(true)

        const timeoutId = window.setTimeout(() => {
            setDisplayedFunnel(selectedFunnel)
            setIsSwitchingFunnel(false)
        }, SKELETON_SWITCH_DELAY_MS)

        return () => window.clearTimeout(timeoutId)
    }, [displayedFunnel, selectedFunnel])

    const isDisconnectedSelection = displayedFunnel.length > 0

    const selectedState = useMemo(() => {
        if (!isDisconnectedSelection) {
            return {
                test: connectedTest,
                kpis: connectedKpis,
                variants: connectedVariants,
                events: connectedEvents,
                chartData: connectedChartData,
                title: connectedTest?.name ?? 'No live tests yet',
                description: connectedTest?.description ?? 'As soon as an A/B test and event stream exist in Supabase, the live dashboard will populate here.',
                activeTestLabel: connectedTest?.name ?? 'No active test',
                activeTestConnected: true,
            }
        }

        return {
            test: null,
            kpis: EMPTY_KPIS,
            variants: [],
            events: [],
            chartData: [],
            title: displayedFunnel,
            description: 'This funnel has not been connected to the shared tracking pipeline yet. Once Vercel and GoHighLevel events are live, this dashboard will populate automatically.',
            activeTestLabel: 'Not connected',
            activeTestConnected: false,
        }
    }, [
        connectedChartData,
        connectedEvents,
        connectedKpis,
        connectedTest,
        connectedVariants,
        displayedFunnel,
        isDisconnectedSelection,
    ])

    const leader = selectedState.variants.find((variant) => variant.is_leader)
    const leaderLabel = leader ? `Variant ${leader.variant_key}` : 'Awaiting traffic'
    const leaderBadge = selectedState.kpis.confidence_level > 0
        ? `${selectedState.kpis.confidence_level.toFixed(1)}% CONFIDENCE`
        : selectedState.activeTestConnected ? 'LIVE CTR' : 'NOT CONNECTED'
    const significanceInsight = leader
        ? `${leaderLabel} currently leads on CTA click-through rate with ${leader.clicks.toLocaleString()} clicks from ${leader.visitors.toLocaleString()} live page views.`
        : selectedState.activeTestConnected
            ? 'Live significance will appear once page views and CTA clicks have accumulated for multiple variants.'
            : 'Connect this funnel to Vercel and GoHighLevel tracking to begin collecting comparable traffic data.'

    return (
        <DashboardLayout>
            <TopNav
                title="Precision Layered Dashboard"
                activeTest={isSwitchingFunnel ? 'Loading...' : selectedState.activeTestLabel}
                activeTestConnected={isSwitchingFunnel ? false : selectedState.activeTestConnected}
                rightContent={
                    <div className="flex items-center gap-3">
                        <label className="sr-only" htmlFor="funnel-project-select">
                            Select funnel project
                        </label>
                        <select
                            id="funnel-project-select"
                            value={selectedFunnel}
                            onChange={(event) => setSelectedFunnel(event.target.value)}
                            className="h-10 min-w-[16rem] rounded-xl bg-surface-container-low px-4 text-sm font-semibold text-on-surface outline-none transition focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">Current connected test funnel</option>
                            {selectableFunnelNames.map((funnelName) => (
                                <option key={funnelName} value={funnelName}>
                                    {funnelName}
                                </option>
                            ))}
                        </select>
                        <button
                            className="btn-secondary px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!selectedState.activeTestConnected || isSwitchingFunnel}
                        >
                            {selectedState.test?.status === 'active' ? 'Pause Test' : 'Review Test'}
                        </button>
                        <button
                            className="bg-gradient-to-br from-primary to-primary-container text-white font-semibold px-5 py-2 rounded-xl text-sm ambient-shadow-primary hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!selectedState.activeTestConnected || isSwitchingFunnel}
                        >
                            {leader ? `Deploy Variant ${leader.variant_key}` : 'Awaiting Leader'}
                        </button>
                    </div>
                }
            />

            <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-end flex-wrap gap-4">
                    <div>
                        {isSwitchingFunnel ? (
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-7 w-28 rounded-full bg-surface-container-high animate-pulse" />
                                <div className="h-4 w-40 rounded bg-surface-container-high animate-pulse" />
                            </div>
                        ) : selectedState.test ? (
                            <div className="flex items-center gap-3 mb-2">
                                <span className="badge-active">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    {selectedState.test.status.charAt(0).toUpperCase() + selectedState.test.status.slice(1)}
                                </span>
                                <span className="text-on-surface-variant text-sm font-medium">
                                    Started {new Date(selectedState.test.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 mb-2">
                                <span className="badge-draft">Not connected</span>
                                <span className="text-on-surface-variant text-sm font-medium">
                                    Waiting for first tracked event
                                </span>
                            </div>
                        )}
                        {isSwitchingFunnel ? (
                            <>
                                <div className="h-12 w-[30rem] max-w-full rounded bg-surface-container-high animate-pulse" />
                                <div className="h-5 w-[36rem] max-w-full rounded bg-surface-container-high animate-pulse mt-3" />
                            </>
                        ) : (
                            <>
                                <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">
                                    {selectedState.title}
                                </h1>
                                <p className="text-on-surface-variant mt-1 text-lg">
                                    {selectedState.description}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {isSwitchingFunnel ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                            <DashboardSkeletonCard />
                            <DashboardSkeletonCard />
                            <DashboardSkeletonCard />
                            <DashboardSkeletonCard />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <DashboardSkeletonPanel heightClass="min-h-[24rem]" />
                                <DashboardSkeletonPanel heightClass="min-h-[18rem]" />
                                <DashboardSkeletonPanel heightClass="min-h-[18rem]" />
                            </div>
                            <div className="space-y-6">
                                <DashboardSkeletonPanel heightClass="min-h-[16rem]" />
                                <DashboardSkeletonPanel heightClass="min-h-[20rem]" />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                            <KpiCard
                                icon="group"
                                iconBg="bg-blue-50"
                                iconColor="text-blue-600"
                                label="Total Page Views"
                                value={selectedState.kpis.total_visitors.toLocaleString()}
                            />
                            <KpiCard
                                icon="ads_click"
                                iconBg="bg-emerald-50"
                                iconColor="text-emerald-600"
                                label="Total CTA Clicks"
                                value={selectedState.kpis.total_clicks.toLocaleString()}
                            />
                            <KpiCard
                                icon="insights"
                                iconBg="bg-purple-50"
                                iconColor="text-purple-600"
                                label="CTA Click Rate"
                                value={`${selectedState.kpis.conversion_rate.toFixed(1)}%`}
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
                                <ConversionChart data={selectedState.chartData} />
                                <FunnelView variants={selectedState.variants} />
                                <VariantTable variants={selectedState.variants} />
                            </div>

                            <div className="space-y-6">
                                <StatisticalSignificance
                                    confidence={selectedState.kpis.confidence_level}
                                    leaderVariant={leaderLabel}
                                    insight={significanceInsight}
                                />
                                <RecentEvents events={selectedState.events} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}
