interface KpiCardProps {
    icon: string
    iconBg: string
    iconColor: string
    label: string
    value: string
    trend?: string
    trendPositive?: boolean
}

export default function KpiCard({
    icon,
    iconBg,
    iconColor,
    label,
    value,
    trend,
    trendPositive = true,
}: KpiCardProps) {
    return (
        <div className="card p-6 hover:shadow-ambient transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
                </div>
                {trend && (
                    <span
                        className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg ${trendPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
                            }`}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                            {trendPositive ? 'trending_up' : 'trending_down'}
                        </span>
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-on-surface-variant text-sm font-medium">{label}</p>
            <p className="text-3xl font-extrabold text-on-surface mt-1 font-headline">{value}</p>
        </div>
    )
}
