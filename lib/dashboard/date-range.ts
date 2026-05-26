export type DashboardDateRange = {
    start: string
    end: string
}

const DASHBOARD_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function getDefaultDashboardDate(now = new Date(), timeZone = 'UTC'): string {
    if (timeZone !== 'UTC') {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).formatToParts(now)
        const year = parts.find((part) => part.type === 'year')?.value
        const month = parts.find((part) => part.type === 'month')?.value
        const day = parts.find((part) => part.type === 'day')?.value

        if (year && month && day) {
            return `${year}-${month}-${day}`
        }
    }

    return now.toISOString().slice(0, 10)
}

export function isValidDashboardDate(value: string | undefined): value is string {
    if (!value || !DASHBOARD_DATE_PATTERN.test(value)) {
        return false
    }

    const parsed = new Date(`${value}T00:00:00.000Z`)
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export function buildUtcDateRange(dateValue: string): DashboardDateRange {
    if (!isValidDashboardDate(dateValue)) {
        throw new Error(`Invalid dashboard date: ${dateValue}`)
    }

    const startDate = new Date(`${dateValue}T00:00:00.000Z`)
    const endDate = new Date(startDate)
    endDate.setUTCDate(startDate.getUTCDate() + 1)

    return {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
    }
}
