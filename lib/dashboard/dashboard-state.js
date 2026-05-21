const EMPTY_KPIS = {
  total_visitors: 0,
  total_clicks: 0,
  total_purchases: 0,
  conversion_rate: 0,
  purchase_conversion_rate: 0,
  leader_variant: '—',
  leader_metric: 'ctr',
  confidence_level: 0,
}

function toConnectedState(dataset) {
  return {
    test: dataset.test,
    kpis: dataset.kpis,
    variants: dataset.variants,
    events: dataset.events,
    chartData: dataset.chartData,
    title: dataset.test?.name ?? 'No live tests yet',
    description:
      dataset.test?.description ??
      'As soon as an A/B test and event stream exist in Supabase, the live dashboard will populate here.',
    activeTestLabel: dataset.test?.name ?? 'No active test',
    activeTestConnected: true,
  }
}

export function resolveDashboardSelection({
  selectedTestName,
  connectedDataset,
  datasetsByName,
}) {
  if (!selectedTestName) {
    return toConnectedState(connectedDataset)
  }

  const selectedDataset = datasetsByName[selectedTestName]

  if (selectedDataset) {
    return toConnectedState(selectedDataset)
  }

  return {
    test: null,
    kpis: EMPTY_KPIS,
    variants: [],
    events: [],
    chartData: [],
    title: selectedTestName,
    description:
      'This funnel has not been connected to the shared tracking pipeline yet. Once Vercel and GoHighLevel events are live, this dashboard will populate automatically.',
    activeTestLabel: 'Not connected',
    activeTestConnected: false,
  }
}
