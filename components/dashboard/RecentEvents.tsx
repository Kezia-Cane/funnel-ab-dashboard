import type { RecentEvent } from '@/types'

interface RecentEventsProps {
    events: RecentEvent[]
    onViewAll?: () => void
}

const dotColors = {
    success: 'bg-primary',
    info: 'bg-outline-variant',
    warning: 'bg-amber-400',
}

export default function RecentEvents({ events, onViewAll }: RecentEventsProps) {
    return (
        <div className="card p-6">
            <h3 className="text-lg font-bold text-on-surface font-headline mb-5">Recent Events</h3>
            {events.length ? (
                <div className="space-y-4">
                    {events.map((event) => (
                        <div key={event.id} className="flex gap-3">
                            <div
                                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColors[event.type]}`}
                            />
                            <div>
                                <p className="text-sm font-semibold text-on-surface">{event.title}</p>
                                <p className="text-xs text-on-surface-variant mt-0.5">{event.description}</p>
                                <p className="text-[10px] font-bold text-outline uppercase tracking-wide mt-1">{event.time_ago}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl bg-surface-container-low/60 px-4 py-5">
                    <p className="text-sm text-on-surface-variant">
                        No live telemetry has landed yet. New page views and CTA clicks will appear here automatically.
                    </p>
                </div>
            )}
            <button
                onClick={onViewAll}
                className="w-full mt-6 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-bold text-[10px] uppercase tracking-widest hover:bg-surface-container-low transition-colors"
            >
                View Full Audit Log
            </button>
        </div>
    )
}
