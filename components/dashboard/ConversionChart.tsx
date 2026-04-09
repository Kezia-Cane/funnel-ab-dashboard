'use client'

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'
import type { ChartDataPoint } from '@/types'
import { SAMPLE_CHART_DATA } from '@/lib/sample-data'

interface ConversionChartProps {
    data?: ChartDataPoint[]
}

const VARIANT_COLORS = {
    variantA: '#94a3b8',
    variantB: '#3525cd',
    variantC: '#a78bfa',
}

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

export default function ConversionChart({ data = SAMPLE_CHART_DATA }: ConversionChartProps) {
    return (
        <div className="card p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-bold text-on-surface font-headline">Conversion Performance</h3>
                    <p className="text-sm text-on-surface-variant mt-0.5">Daily conversion rate tracking across all segments.</p>
                </div>
                <div className="flex gap-4">
                    {Object.entries(VARIANT_COLORS).map(([key, color]) => (
                        <div key={key} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-xs font-semibold text-on-surface-variant">
                                {key.replace('variant', '')}
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
                    <Line
                        type="monotone"
                        dataKey="variantA"
                        stroke={VARIANT_COLORS.variantA}
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="variantB"
                        stroke={VARIANT_COLORS.variantB}
                        strokeWidth={4}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="variantC"
                        stroke={VARIANT_COLORS.variantC}
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
