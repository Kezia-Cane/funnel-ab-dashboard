function sortTestsByPriority(left, right) {
  if ((right.total_visitors ?? 0) !== (left.total_visitors ?? 0)) {
    return (right.total_visitors ?? 0) - (left.total_visitors ?? 0)
  }

  if ((right.total_clicks ?? 0) !== (left.total_clicks ?? 0)) {
    return (right.total_clicks ?? 0) - (left.total_clicks ?? 0)
  }

  return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
}

export function selectConnectedTest(tests, preferredTestName) {
  const activeTests = tests.filter((item) => item.status === 'active')
  const preferredTest = tests.find((item) => item.name.trim() === preferredTestName)

  if (preferredTest) {
    return preferredTest
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
