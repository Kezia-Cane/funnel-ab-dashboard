import type { Metadata } from 'next'
import DashboardExperience from '@/components/dashboard/DashboardExperience'
import { EMPTY_DASHBOARD_KPIS } from '@/components/dashboard/dashboard-data'
import { buildSelectableFunnelNames, selectConnectedTest } from '@/lib/dashboard/funnel-options'
import {
    getDashboardDatasetByTestId,
    getDashboardDatasetByTestKey,
    getTestsWithAnalytics,
} from '@/lib/supabase/queries'

export const metadata: Metadata = {
    title: 'Dashboard',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const JIYU_TEST_KEY = 'jiyu_headline_v1'
const PREFERRED_CONNECTED_TEST_NAME = 'JiYu Headline Test V1'
const EXCLUDED_DROPDOWN_TEST_NAMES = ['NAD Headline Test V1']

export default async function DashboardPage() {
    try {
        const tests = await getTestsWithAnalytics()
        const jiyuDataset = await getDashboardDatasetByTestKey(JIYU_TEST_KEY)
        const connectedTest = selectConnectedTest(tests, {
            preferredTestKey: JIYU_TEST_KEY,
            preferredTestName: PREFERRED_CONNECTED_TEST_NAME,
        })

        const datasets = await Promise.all(
            tests.map(async (currentTest) => {
                if (jiyuDataset.test?.id === currentTest.id) {
                    return jiyuDataset
                }

                return getDashboardDatasetByTestId(currentTest.id)
            }),
        )

        const connectedDataset = jiyuDataset.test
            ? jiyuDataset
            : datasets.find((dataset) => dataset.test?.id === connectedTest?.id) ?? {
                test: null,
                kpis: EMPTY_DASHBOARD_KPIS,
                variants: [],
                events: [],
                chartData: [],
            }

        const datasetsByName = Object.fromEntries(
            datasets
                .filter((dataset) => dataset.test?.name)
                .map((dataset) => [dataset.test!.name, dataset]),
        )

        const selectableFunnelNames = buildSelectableFunnelNames(
            tests,
            connectedDataset.test?.name ?? connectedTest?.name,
            EXCLUDED_DROPDOWN_TEST_NAMES,
        )

        return (
            <DashboardExperience
                connectedDataset={connectedDataset}
                datasetsByName={datasetsByName}
                selectableFunnelNames={selectableFunnelNames}
            />
        )
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'

        return (
            <DashboardExperience
                connectedDataset={{
                    test: null,
                    kpis: EMPTY_DASHBOARD_KPIS,
                    variants: [],
                    events: [],
                    chartData: [],
                }}
                datasetsByName={{}}
                selectableFunnelNames={[]}
                fetchError={`Unable to load live JiYu dashboard data from Supabase: ${message}`}
            />
        )
    }
}
