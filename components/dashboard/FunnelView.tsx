import type { VariantStats } from '@/types'

interface FunnelViewProps {
    variants: VariantStats[]
}

export default function FunnelView({ variants }: FunnelViewProps) {
    if (!variants.length) {
        return (
            <div className="card p-8">
                <h3 className="text-xl font-bold text-on-surface font-headline">Funnel Walkthrough (Views → CTA Clicks → Purchases)</h3>
                <p className="text-sm text-on-surface-variant mt-1">
                    Live funnel metrics will appear after page views and CTA clicks start flowing into Supabase.
                </p>
            </div>
        )
    }

    return (
        <div className="card overflow-hidden">
            <div className="px-8 py-6 border-b border-surface-container-low">
                <h3 className="text-xl font-bold text-on-surface font-headline">Funnel Walkthrough (Views → CTA Clicks → Purchases)</h3>
                <p className="text-sm text-on-surface-variant mt-1">Comparing traffic quality across the pipeline.</p>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {variants.map((v) => {
                    const views = v.visitors || 0
                    const clicks = v.clicks || 0
                    const purchases = v.purchases || 0

                    const clickThrough = views > 0 ? (clicks / views) * 100 : 0
                    const purchaseThrough = clicks > 0 ? (purchases / clicks) * 100 : 0
                    const purchaseBarWidth = views > 0 ? Math.min((purchases / views) * 500, 100) : 0

                    return (
                        <div
                            key={v.variant_key}
                            className={`rounded-2xl p-6 ${v.is_leader ? 'bg-primary/5 border border-primary/20' : 'bg-surface-container-low/50'}`}
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <span className={`text-lg font-bold ${v.is_leader ? 'text-primary' : 'text-on-surface'}`}>
                                    Variant {v.variant_key}
                                </span>
                                {v.is_leader && (
                                    <span className="badge-leader px-2 py-0.5 text-[10px]">Leader</span>
                                )}
                            </div>

                            <div className="space-y-4">
                                {/* Views */}
                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Views</span>
                                        <span className="font-semibold text-on-surface">{views.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
                                    </div>
                                </div>

                                <div className="flex justify-end pr-2">
                                    <span className="text-[10px] font-bold text-slate-400">↓ {clickThrough.toFixed(1)}% CTR</span>
                                </div>

                                {/* Clicks */}
                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Clicks</span>
                                        <span className="font-semibold text-on-surface">{clicks.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(clickThrough, 100)}%` }} />
                                    </div>
                                </div>

                                <div className="flex justify-end pr-2">
                                    <span className="text-[10px] font-bold text-slate-400">↓ {purchaseThrough.toFixed(1)}% to Purchase</span>
                                </div>

                                {/* Purchases */}
                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Purchases</span>
                                        <span className="font-bold text-primary">{purchases.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${purchaseBarWidth}%`, minWidth: purchases > 0 ? '4px' : '0' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
