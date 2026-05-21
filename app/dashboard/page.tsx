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

    const datasets = await Promise.all(
        tests.map(async (currentTest) => {
            const [kpis, variants, events, chartData] = await Promise.all([
                getDashboardKPIs(currentTest.id),
                getVariantStats(currentTest.id),
                getRecentActivity(5, currentTest.id),
                getDailyCtrChartData(currentTest.id),
            ])

            return {
                test: currentTest,
                kpis,
                variants,
                events,
                chartData,
            }
        }),
    )

    const connectedDataset = datasets.find((dataset) => dataset.test.id === test?.id) ?? {
        test: null,
        kpis: EMPTY_DASHBOARD_KPIS,
        variants: [],
        events: [],
        chartData: [],
    }

    const datasetsByName = Object.fromEntries(
        datasets.map((dataset) => [dataset.test.name, dataset]),
    )

    const selectableFunnelNames = buildSelectableFunnelNames(
        tests,
        test?.name,
        EXCLUDED_DROPDOWN_TEST_NAMES,
    )

    return (
        <DashboardExperience
            connectedDataset={connectedDataset}
            datasetsByName={datasetsByName}
            selectableFunnelNames={selectableFunnelNames}
        />
    )
}
