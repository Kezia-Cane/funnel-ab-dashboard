'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/tests', label: 'Tests', icon: 'science' },
    { href: '/events', label: 'Event Logs', icon: 'history' },
    { href: '/settings', label: 'Settings', icon: 'settings' },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="flex flex-col h-full w-64 shrink-0 py-6 px-4 bg-surface-container-low border-r-0">
            {/* Brand */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white material-symbols-filled" style={{ fontSize: '20px' }}>
                        architecture
                    </span>
                </div>
                <div>
                    <div className="text-base font-extrabold text-on-surface font-headline">Architect</div>
                    <div className="text-[11px] text-on-surface-variant font-medium">Marketing Funnels</div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                {item.icon}
                            </span>
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Upgrade Nudge */}
            <div className="mb-4 p-4 rounded-2xl bg-surface-container">
                <p className="text-[11px] text-on-surface-variant font-medium mb-3">Usage Limit</p>
                <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-primary rounded-full" style={{ width: '65%' }} />
                </div>
                <p className="text-[10px] text-on-surface-variant">65% of monthly tests used</p>
            </div>

            {/* User Profile */}
            <div className="pt-4 border-t border-outline-variant/15">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary material-symbols-filled" style={{ fontSize: '18px' }}>
                            account_circle
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-on-surface">Alex Rivera</p>
                        <p className="text-xs text-on-surface-variant truncate">Lead Analyst</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
