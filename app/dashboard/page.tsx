import type { Metadata } from 'next'
import DashboardExperience from '@/components/dashboard/DashboardExperience'
import { EMPTY_DASHBOARD_KPIS } from '@/components/dashboard/dashboard-data'
import {
    getDashboardKPIs,
    getDailyCtrChartData,
    getRecentActivity,
    getTestsWithAnalytics,
    getVariantStats,
} from '@/lib/supabase/queries'

export const metadata: Metadata = {
    title: 'Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const tests = await getTestsWithAnalytics()
    const activeTests = tests.filter((item) => item.status === 'active')

    const test =
        activeTests.sort((a, b) => {
            if (b.total_visitors !== a.total_visitors) {
                return b.total_visitors - a.total_visitors
            }

            if (b.total_clicks !== a.total_clicks) {
                return b.total_clicks - a.total_clicks
            }

            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })[0] ??
        tests[0] ??
        null

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
