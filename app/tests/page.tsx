import type { Metadata } from 'next'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopNav from '@/components/layout/TopNav'
import { getTestsWithAnalytics, getVariantStats, getVariantsByTestId } from '@/lib/supabase/queries'
import type { TestStatus } from '@/types'

export const metadata: Metadata = { title: 'Tests' }

export const dynamic = 'force-dynamic'

function StatusBadge({ status }: { status: TestStatus }) {
    switch (status) {
        case 'active':
            return (
                <span className="badge-active">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    Active
                </span>
            )
        case 'completed':
            return <span className="badge-completed">Completed</span>
        case 'draft':
            return <span className="badge-draft">Draft</span>
        case 'paused':
            return <span className="badge-paused">Paused</span>
    }
}

function ActionButton({ status }: { status: TestStatus }) {
    if (status === 'active') {
        return (
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>more_horiz</span>
            </button>
        )
    }
    if (status === 'completed') {
        return (
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>bar_chart</span>
            </button>
        )
    }
    return (
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>edit</span>
        </button>
    )
}

export default async function TestsPage() {
    const tests = await getTestsWithAnalytics()
    const featuredTest = tests.find((test) => test.status === 'active') ?? tests[0] ?? null

    const [featuredVariants, featuredStats] = featuredTest
        ? await Promise.all([
            getVariantsByTestId(featuredTest.id),
            getVariantStats(featuredTest.id),
        ])
        : [[], []]

    return (
        <DashboardLayout>
            <TopNav
                title="Test Experiments"
                searchPlaceholder="Search tests..."
                rightContent={
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-on-surface-variant font-medium hidden lg:block">Alex Sterling</span>
                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary material-symbols-filled" style={{ fontSize: '18px' }}>account_circle</span>
                        </div>
                    </div>
                }
            />

            <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">
                            Test Experiments
                        </h1>
                        <p className="text-on-surface-variant mt-1 text-lg">
                            Live tests and their CTA performance pulled directly from Supabase.
                        </p>
                    </div>
                    <button className="btn-primary px-6 py-3 flex items-center gap-2 text-sm font-semibold">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                        Create New Test
                    </button>
                </div>

                <div className="card overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest bg-surface-container-low/50">
                                <th className="px-8 py-4">Test Name</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Start Date</th>
                                <th className="px-8 py-4">Leader</th>
                                <th className="px-8 py-4">CTA CTR</th>
                                <th className="px-8 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container-low">
                            {tests.length ? tests.map((test) => (
                                <tr key={test.id} className="hover:bg-surface-container-low/20 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`w-1 self-stretch rounded-full shrink-0 mt-0.5 ${test.status === 'active' ? 'bg-primary' : 'bg-outline-variant/50'}`}
                                            />
                                            <div>
                                                <Link
                                                    href={`/tests/${test.id}`}
                                                    className="font-semibold text-on-surface hover:text-primary transition-colors"
                                                >
                                                    {test.name}
                                                </Link>
                                                <p className="text-xs text-on-surface-variant mt-0.5">
                                                    {test.test_key}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <StatusBadge status={test.status} />
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-on-surface-variant">
                                        {new Date(test.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-on-surface">
                                        {test.leader_variant ? `Variant ${test.leader_variant}` : 'Awaiting traffic'}
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-on-surface">
                                        {test.ctr.toFixed(1)}%
                                    </td>
                                    <td className="px-8 py-5">
                                        <ActionButton status={test.status} />
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-sm text-on-surface-variant">
                                        No tests have been created in Supabase yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {featuredTest ? (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-extrabold text-on-surface font-headline">
                                Inside Test View: {featuredTest.name}
                            </h2>
                            <span className="px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface-variant text-xs font-bold">
                                {featuredTest.confidence_level > 0
                                    ? `Confidence: ${featuredTest.confidence_level.toFixed(1)}%`
                                    : 'Confidence pending'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {featuredVariants.map((variant) => {
                                const stat = featuredStats.find((item) => item.variant_key === variant.variant_key)

                                if (!stat) return null

                                return (
                                    <div
                                        key={variant.id}
                                        className={`card p-6 ${stat.is_leader ? 'ring-2 ring-primary relative' : ''}`}
                                    >
                                        {stat.is_leader && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider">
                                                    Leading
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Variant {variant.variant_key}</p>
                                                <p className={`${stat.is_control ? 'text-primary' : 'text-on-surface'} font-bold text-sm mt-0.5`}>
                                                    {stat.is_control ? 'CONTROL' : stat.is_leader ? 'LEADER' : 'CHALLENGER'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-3xl font-extrabold font-headline ${stat.is_leader ? 'text-primary' : 'text-on-surface'}`}>{stat.ctr.toFixed(1)}%</p>
                                                {(stat.lift ?? 0) > 0 ? (
                                                    <p className="text-[10px] text-emerald-600 font-bold">+{(stat.lift ?? 0).toFixed(1)}% lift</p>
                                                ) : (
                                                    <p className="text-[10px] text-on-surface-variant font-bold">CTA CTR</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-3 mt-4">
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

                        <div className="flex justify-end gap-3 mt-6">
                            <button className="btn-secondary px-6 py-3 text-sm font-semibold">Discard Changes</button>
                            <button className="btn-secondary px-6 py-3 text-sm font-semibold">Save as New Draft</button>
                            <button className="btn-primary px-6 py-3 text-sm font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>rocket_launch</span>
                                Push to Live
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </DashboardLayout>
    )
}
