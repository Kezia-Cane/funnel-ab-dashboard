interface StatisticalSignificanceProps {
    confidence: number
    leaderVariant: string
    insight?: string
}

export default function StatisticalSignificance({
    confidence,
    leaderVariant,
    insight = "Variant B's long-form, benefit-driven headline is outperforming short hooks by 58%. Mobile users show a 2.4x preference for Variant B.",
}: StatisticalSignificanceProps) {
    const isConclusive = confidence >= 95

    return (
        <div className="card p-6">
            <h3 className="text-lg font-bold text-on-surface font-headline mb-5">Statistical Significance</h3>

            <div className="space-y-5">
                {/* Progress Bar */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-on-surface-variant">Confidence Level</span>
                        <span className="font-bold text-primary">{confidence.toFixed(1)}%</span>
                    </div>
                    <div className="confidence-bar">
                        <div
                            className={`h-full rounded-full transition-all ${isConclusive ? 'bg-emerald-500' : 'bg-primary'}`}
                            style={{ width: `${Math.min(confidence, 100)}%` }}
                        />
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-2 italic leading-relaxed">
                        {isConclusive
                            ? `Conclusive result! ${leaderVariant} is the winner at ${confidence.toFixed(1)}% confidence.`
                            : `Required: 95.0% for conclusive results. Remaining: ~24 hours of traffic.`}
                    </p>
                </div>

                {/* Insight Box */}
                <div className="p-4 rounded-xl bg-secondary-container/10 border border-secondary-container/20">
                    <div className="flex items-center gap-2 text-secondary font-bold text-sm mb-1.5">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>info</span>
                        Insight
                    </div>
                    <p className="text-xs text-on-secondary-container font-medium leading-relaxed">{insight}</p>
                </div>
            </div>
        </div>
    )
}
