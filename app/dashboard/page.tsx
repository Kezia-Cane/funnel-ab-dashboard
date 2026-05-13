import type { Metadata } from 'next'
import DashboardExperience from '@/components/dashboard/DashboardExperience'
import { EMPTY_DASHBOARD_KPIS } from '@/components/dashboard/dashboard-data'
import {
    getDashboardKPIs,
    getDailyCtrChartData,
    getRecentActivity,
    getTests,
    getVariantStats,
} from '@/lib/supabase/queries'

export const metadata: Metadata = {
    title: 'Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const tests = await getTests()
    const test = tests.find((item) => item.status === 'active') ?? tests[0] ?? null

    const [kpis, variants, events, chartData] = test
        ? await Promise.all([
            getDashboardKPIs(test.id),
            getVariantStats(test.id),
            getRecentActivity(5, test.id),
            getDailyCtrChartData(test.id),
        ])
        : [EMPTY_DASHBOARD_KPIS, [], [], []]

    return (
        <DashboardExperience
            connectedTest={test}
            connectedKpis={kpis}
            connectedVariants={variants}
            connectedEvents={events}
            connectedChartData={chartData}
        />
    )
}
