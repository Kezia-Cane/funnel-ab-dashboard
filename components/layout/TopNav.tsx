'use client'

interface TopNavProps {
    title: string
    activeTest?: string
    searchPlaceholder?: string
    rightContent?: React.ReactNode
}

export default function TopNav({
    title,
    activeTest = 'NAD Headline Test V1',
    searchPlaceholder = 'Search experiments...',
    rightContent,
}: TopNavProps) {
    return (
        <header className="glass-header flex justify-between items-center h-16 px-8 sticky top-0 z-50">
            <div className="flex items-center gap-6">
                <h2 className="text-base font-semibold text-on-surface font-headline">{title}</h2>
                <div className="relative hidden md:block">
                    <span
                        className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                        style={{ fontSize: '18px' }}
                    >
                        search
                    </span>
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        className="pl-10 pr-4 py-2 bg-surface-container-low border-0 rounded-full focus:ring-2 focus:ring-primary/20 w-56 text-sm outline-none text-on-surface placeholder:text-outline/60 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {rightContent}
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px' }}>
                        notifications
                    </span>
                </button>
                <div className="h-6 w-px bg-outline-variant/30" />
                <div className="hidden lg:flex items-center gap-1.5 text-sm">
                    <span className="text-on-surface-variant font-medium">Active Test:</span>
                    <span className="text-primary font-semibold">{activeTest}</span>
                </div>
            </div>
        </header>
    )
}
