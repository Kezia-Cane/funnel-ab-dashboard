import type { VariantStats } from '@/types'

interface VariantTableProps {
    variants: VariantStats[]
    onExportCsv?: () => void
}

export default function VariantTable({ variants, onExportCsv }: VariantTableProps) {
    return (
        <div className="card overflow-hidden w-full">
            <div className="px-8 py-6 flex justify-between items-center gap-4 flex-wrap border-b border-surface-container-low">
                <h3 className="text-xl font-bold text-on-surface font-headline">Detailed Variant Comparison</h3>
                <button
                    onClick={onExportCsv}
                    className="text-primary font-semibold text-sm flex items-center gap-1 hover:opacity-70 transition-opacity"
                >
                    Export CSV
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                </button>
            </div>

            <div className="w-full overflow-x-auto scrollbar-thin">
                <table className="min-w-[980px] w-full text-left table-fixed">
                    <colgroup>
                        <col className="w-[104px]" />
                        <col className="w-[260px]" />
                        <col className="w-[120px]" />
                        <col className="w-[128px]" />
                        <col className="w-[120px]" />
                        <col className="w-[124px]" />
                        <col className="w-[144px]" />
                        <col className="w-[120px]" />
                    </colgroup>
                    <thead>
                        <tr className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest bg-surface-container-low/50">
                            <th className="px-8 py-4">Variant</th>
                            <th className="px-8 py-4">Headline Text</th>
                            <th className="px-8 py-4">Visitors</th>
                            <th className="px-8 py-4">CTA Clicks</th>
                            <th className="px-8 py-4">CTA CTR</th>
                            <th className="px-8 py-4">Purchases</th>
                            <th className="px-8 py-4">Purchase Rate</th>
                            <th className="px-8 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low">
                        {variants.map((v) => (
                            <tr
                                key={v.variant_key}
                                className={
                                    v.is_leader
                                        ? 'bg-indigo-50/30 border-l-4 border-primary'
                                        : 'hover:bg-surface-container-low/20 transition-colors'
                                }
                            >
                                {/* Variant Key */}
                                <td className="px-8 py-6">
                                    <span className={`font-bold text-lg ${v.is_leader ? 'text-primary' : 'text-on-surface'} flex items-center gap-2`}>
                                        {v.variant_key}
                                        {v.is_leader && (
                                            <span className="material-symbols-outlined material-symbols-filled text-primary" style={{ fontSize: '16px' }}>
                                                star
                                            </span>
                                        )}
                                    </span>
                                </td>

                                {/* Headline */}
                                <td className="px-8 py-6">
                                    <span className={`block whitespace-normal break-words leading-6 text-sm ${v.is_leader ? 'font-semibold text-on-surface' : 'text-on-surface-variant italic'}`}>
                                        &ldquo;{v.headline}&rdquo;
                                    </span>
                                </td>

                                {/* Visitors */}
                                <td className="px-8 py-6 font-semibold text-on-surface tabular-nums">
                                    {v.visitors.toLocaleString()}
                                </td>

                                {/* Clicks */}
                                <td className="px-8 py-6 font-semibold text-on-surface tabular-nums">
                                    {v.clicks.toLocaleString()}
                                </td>

                                {/* CTR */}
                                <td className="px-8 py-6 tabular-nums">
                                    <div>
                                        <span className={`font-bold ${v.is_leader ? 'text-primary text-[15px]' : 'text-on-surface'}`}>
                                            {v.ctr.toFixed(1)}%
                                        </span>
                                        {v.lift !== undefined && v.lift > 0 && (
                                            <p className="text-[10px] font-bold text-emerald-600 mt-0.5">+{v.lift.toFixed(1)}% lift</p>
                                        )}
                                    </div>
                                </td>

                                {/* Purchases */}
                                <td className="px-8 py-6 font-semibold text-primary tabular-nums">
                                    {v.purchases?.toLocaleString() || 0}
                                </td>

                                {/* Purchase Conversion Rate */}
                                <td className="px-8 py-6 tabular-nums">
                                    <span className={`font-bold ${v.is_leader ? 'text-primary text-[15px]' : 'text-on-surface'}`}>
                                        {v.purchase_conversion_rate?.toFixed(2) || '0.00'}%
                                    </span>
                                </td>

                                {/* Status Badge */}
                                <td className="px-8 py-6">
                                    {v.is_leader ? (
                                        <span className="badge-leader">Leader</span>
                                    ) : v.is_control ? (
                                        <span className="badge-control">Control</span>
                                    ) : (
                                        <span className="badge-control">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
