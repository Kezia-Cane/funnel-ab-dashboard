function sortTestsByPriority(left, right) {
  if ((right.total_visitors ?? 0) !== (left.total_visitors ?? 0)) {
    return (right.total_visitors ?? 0) - (left.total_visitors ?? 0)
  }

  if ((right.total_clicks ?? 0) !== (left.total_clicks ?? 0)) {
    return (right.total_clicks ?? 0) - (left.total_clicks ?? 0)
  }

  return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
}

function normalizeValue(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function selectConnectedTest(tests, preferred = {}) {
  const preferredTestKey = normalizeValue(
    typeof preferred === 'string' ? '' : preferred.preferredTestKey,
  ).toLowerCase()
  const preferredTestName = normalizeValue(
    typeof preferred === 'string' ? preferred : preferred.preferredTestName,
  )
  const activeTests = tests.filter((item) => item.status === 'active')
  const preferredTestByKey = preferredTestKey
    ? tests.find((item) => normalizeValue(item.test_key).toLowerCase() === preferredTestKey)
    : null
  const preferredTestByName = preferredTestName
    ? tests.find((item) => normalizeValue(item.name) === preferredTestName)
    : null

  if (preferredTestByKey) {
    return preferredTestByKey
  }

  if (preferredTestByName) {
    return preferredTestByName
  }

  return [...activeTests].sort(sortTestsByPriority)[0] ?? tests[0] ?? null
}

export function buildSelectableFunnelNames(tests, connectedTestName, excludedNames = []) {
  const uniqueNames = new Set()
  const excludedNameSet = new Set(excludedNames.map((name) => name.trim()))

  for (const test of tests) {
    const normalizedName = test.name.trim()

    if (
      !normalizedName ||
      normalizedName === connectedTestName ||
      excludedNameSet.has(normalizedName)
    ) {
      continue
    }

    uniqueNames.add(normalizedName)
  }

  return [...uniqueNames]
}
