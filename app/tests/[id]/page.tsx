import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopNav from '@/components/layout/TopNav'
import { getDashboardKPIs, getTestById, getVariantStats, getVariantsByTestId } from '@/lib/supabase/queries'

export const metadata: Metadata = { title: 'Test Detail' }

export const dynamic = 'force-dynamic'

type TestDetailPageProps = {
    params: Promise<{ id: string }>
}

export default async function TestDetailPage({ params }: TestDetailPageProps) {
    const { id } = await params
    const test = await getTestById(id)

    if (!test) {
        notFound()
    }

    const [variants, stats, kpis] = await Promise.all([
        getVariantsByTestId(test.id),
        getVariantStats(test.id),
        getDashboardKPIs(test.id),
    ])

    const leader = stats.find((variant) => variant.is_leader)

    return (
        <DashboardLayout>
            <TopNav title={test.name} activeTest={test.name} />
            <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`badge-${test.status}`}>
                                {test.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                            </span>
                            <span className="text-on-surface-variant text-sm font-medium">
                                Started {new Date(test.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">{test.name}</h1>
                        <p className="text-on-surface-variant mt-1 text-lg">{test.description}</p>
                        <p className="text-sm text-outline mt-2 font-mono">{test.test_key}</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="btn-secondary px-5 py-2.5 text-sm font-semibold">
                            {test.status === 'active' ? 'Pause Test' : 'Resume Test'}
                        </button>
                        <button className="bg-gradient-to-br from-primary to-primary-container text-white font-semibold px-5 py-2.5 rounded-xl text-sm ambient-shadow-primary hover:opacity-90 transition-opacity">
                            {leader ? `Deploy Variant ${leader.variant_key}` : 'Awaiting Leader'}
                        </button>
                    </div>
                </div>

                {variants.length ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {variants.map((variant) => {
                            const stat = stats.find((item) => item.variant_key === variant.variant_key)

                            if (!stat) return null

                            return (
                                <div
                                    key={variant.id}
                                    className={`card p-6 relative ${stat.is_leader ? 'ring-2 ring-primary' : ''}`}
                                >
                                    {stat.is_leader && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider">
                                                Leading
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                                                Variant {variant.variant_key}
                                            </p>
                                            <p className={`font-bold text-sm mt-0.5 ${stat.is_control ? 'text-primary' : 'text-on-surface'}`}>
                                                {stat.is_control ? 'CONTROL' : stat.is_leader ? 'LEADER' : 'CHALLENGER'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-3xl font-extrabold font-headline ${stat.is_leader ? 'text-primary' : 'text-on-surface'}`}>
                                                {stat.ctr.toFixed(1)}%
                                            </p>
                                            {(stat.lift ?? 0) > 0 ? (
                                                <p className="text-[10px] text-emerald-600 font-bold">+{(stat.lift ?? 0).toFixed(1)}% lift</p>
                                            ) : (
                                                <p className="text-[10px] text-on-surface-variant font-bold">CTA CTR</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        {[
                                            { label: 'Visitors', value: stat.visitors.toLocaleString() },
                                            { label: 'Clicks', value: stat.clicks.toLocaleString() },
                                            { label: 'CTR', value: `${stat.ctr.toFixed(1)}%` },
                                        ].map((item) => (
                                            <div key={item.label} className="bg-surface-container-low rounded-xl p-2.5 text-center">
                                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">{item.label}</p>
                                                <p className="text-sm font-bold text-on-surface mt-0.5">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Headline</p>
                                            <div className="p-3 rounded-xl bg-surface-container-low text-sm text-on-surface font-medium leading-relaxed">
                                                {variant.headline}
                                            </div>
                                        </div>
                                        {variant.subheadline ? (
                                            <div>
                                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Subheadline</p>
                                                <div className="p-3 rounded-xl bg-surface-container-low text-xs text-on-surface-variant leading-relaxed">
                                                    {variant.subheadline}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="card p-8">
                        <p className="text-sm text-on-surface-variant">
                            This test exists in Supabase, but it does not have any variants yet.
                        </p>
                    </div>
                )}

                <div className="card p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Live Summary</p>
                            <h2 className="text-2xl font-extrabold text-on-surface font-headline">
                                {leader ? `Variant ${leader.variant_key} leads on CTA clicks` : 'Waiting for enough live traffic'}
                            </h2>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-on-surface-variant">Confidence</p>
                            <p className="text-2xl font-extrabold text-primary">{kpis.confidence_level.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
