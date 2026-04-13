'use client'

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import type { ChartDataPoint } from '@/types'

interface ConversionChartProps {
    data?: ChartDataPoint[]
}

const VARIANT_COLORS = ['#94a3b8', '#3525cd', '#10b981', '#f59e0b', '#a855f7']

interface CustomTooltipProps {
    active?: boolean
    payload?: Array<{ name: string; value: number; color: string }>
    label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-white rounded-2xl shadow-ambient p-4 border border-surface-container-low">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{label}</p>
            {payload.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs font-semibold text-on-surface">
                        {entry.name.replace('variant', 'Variant ')}: {entry.value}%
                    </span>
                </div>
            ))}
        </div>
    )
}

export default function ConversionChart({ data = [] }: ConversionChartProps) {
    const variantKeys = Array.from(
        new Set(
            data.flatMap((point) => Object.keys(point).filter((key) => key !== 'date')),
        ),
    )

    if (!data.length || !variantKeys.length) {
        return (
            <div className="card p-8">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-on-surface font-headline">CTA Click-Through Performance</h3>
                        <p className="text-sm text-on-surface-variant mt-0.5">
                            Daily page-view to CTA-click rate from live Supabase traffic.
                        </p>
                    </div>
                </div>
                <div className="h-60 rounded-2xl bg-surface-container-low/50 flex items-center justify-center text-center px-6">
                    <p className="text-sm text-on-surface-variant">
                        Live trend lines will appear here as soon as page views and CTA clicks arrive for the selected test.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="card p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-bold text-on-surface font-headline">CTA Click-Through Performance</h3>
                    <p className="text-sm text-on-surface-variant mt-0.5">Daily page-view to CTA-click rate from live Supabase traffic.</p>
                </div>
                <div className="flex gap-4">
                    {variantKeys.map((key, index) => (
                        <div key={key} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: VARIANT_COLORS[index % VARIANT_COLORS.length] }} />
                            <span className="text-xs font-semibold text-on-surface-variant">
                                Variant {key}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e7ff" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#777587', fontFamily: 'Inter', letterSpacing: 1 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fontWeight: 600, fill: '#777587', fontFamily: 'Inter' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {variantKeys.map((key, index) => (
                        <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            name={`Variant ${key}`}
                            stroke={VARIANT_COLORS[index % VARIANT_COLORS.length]}
                            strokeWidth={key === 'B' ? 4 : 3}
                            dot={false}
                            activeDot={{ r: key === 'B' ? 6 : 5, strokeWidth: 0 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
