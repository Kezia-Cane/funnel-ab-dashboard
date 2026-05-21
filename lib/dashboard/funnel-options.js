export function buildSelectableFunnelNames(tests, connectedTestName) {
  const uniqueNames = new Set()

  for (const test of tests) {
    const normalizedName = test.name.trim()

    if (!normalizedName || normalizedName === connectedTestName) {
      continue
    }

    uniqueNames.add(normalizedName)
  }

  return [...uniqueNames]
}
