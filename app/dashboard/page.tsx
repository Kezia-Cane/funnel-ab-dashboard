import type { Metadata } from 'next'
import DashboardExperience from '@/components/dashboard/DashboardExperience'
import { EMPTY_DASHBOARD_KPIS } from '@/components/dashboard/dashboard-data'
import { buildSelectableFunnelNames, selectConnectedTest } from '@/lib/dashboard/funnel-options'
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

const PREFERRED_CONNECTED_TEST_NAME = 'JiYu Headline Test V1'
const EXCLUDED_DROPDOWN_TEST_NAMES = ['NAD Headline Test V1']

export default async function DashboardPage() {
    const tests = await getTestsWithAnalytics()
    const test = selectConnectedTest(tests, PREFERRED_CONNECTED_TEST_NAME)

    const [kpis, variants, events, chartData] = test
        ? await Promise.all([
            getDashboardKPIs(test.id),
            getVariantStats(test.id),
            getRecentActivity(5, test.id),
            getDailyCtrChartData(test.id),
        ])
        : [EMPTY_DASHBOARD_KPIS, [], [], []]

    const selectableFunnelNames = buildSelectableFunnelNames(
        tests,
        test?.name,
        EXCLUDED_DROPDOWN_TEST_NAMES,
    )

    return (
        <DashboardExperience
            connectedTest={test}
            connectedKpis={kpis}
            connectedVariants={variants}
            connectedEvents={events}
            connectedChartData={chartData}
            selectableFunnelNames={selectableFunnelNames}
        />
    )
}
