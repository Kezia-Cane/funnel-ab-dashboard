import type { Metadata } from 'next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopNav from '@/components/layout/TopNav'
import {
    SAMPLE_TESTS,
    SAMPLE_VARIANTS,
    SAMPLE_VARIANT_STATS,
} from '@/lib/sample-data'

export const metadata: Metadata = { title: 'Test Detail' }

type TestDetailPageProps = {
    params: Promise<{ id: string }>
}

export default async function TestDetailPage({ params }: TestDetailPageProps) {
    const { id } = await params

    // In production this would fetch from Supabase using params.id
    const test = SAMPLE_TESTS.find((t) => t.id === id) ?? SAMPLE_TESTS[0]
    const variants = SAMPLE_VARIANTS
    const stats = SAMPLE_VARIANT_STATS

    return (
        <DashboardLayout>
            <TopNav title={test.name} activeTest={test.name} />
            <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
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
                        <button className="btn-secondary px-5 py-2.5 text-sm font-semibold">Pause Test</button>
                        <button className="bg-gradient-to-br from-primary to-primary-container text-white font-semibold px-5 py-2.5 rounded-xl text-sm ambient-shadow-primary hover:opacity-90 transition-opacity">
                            Deploy Variant B
                        </button>
                    </div>
                </div>

                {/* Variant Detail Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {variants.map((variant) => {
                        const stat = stats.find((s) => s.variant_key === variant.variant_key)!
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
                                            {stat.conversion_rate}%
                                        </p>
                                        {stat.lift !== undefined && stat.lift > 0 && (
                                            <p className="text-[10px] text-emerald-600 font-bold">+{stat.lift.toFixed(1)}% lift</p>
                                        )}
                                        {stat.is_control && <p className="text-[10px] text-on-surface-variant font-bold">Conv. Rate</p>}
                                    </div>
                                </div>

                                {/* Stats row */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {[
                                        { label: 'Visitors', value: stat.visitors.toLocaleString() },
                                        { label: 'Clicks', value: stat.clicks.toLocaleString() },
                                        { label: 'CTR', value: `${stat.ctr}%` },
                                    ].map((item) => (
                                        <div key={item.label} className="bg-surface-container-low rounded-xl p-2.5 text-center">
                                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">{item.label}</p>
                                            <p className="text-sm font-bold text-on-surface mt-0.5">{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Headline */}
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Headline</p>
                                        <div className="p-3 rounded-xl bg-surface-container-low text-sm text-on-surface font-medium leading-relaxed">
                                            {variant.headline}
                                        </div>
                                    </div>
                                    {variant.subheadline && (
                                        <div>
                                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Subheadline</p>
                                            <div className="p-3 rounded-xl bg-surface-container-low text-xs text-on-surface-variant leading-relaxed">
                                                {variant.subheadline}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </DashboardLayout>
    )
}
