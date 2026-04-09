import type { Metadata } from 'next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopNav from '@/components/layout/TopNav'

export const metadata: Metadata = { title: 'Settings' }

const TRACKING_ENDPOINT = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/ab-track`
    : 'http://localhost:3000/api/ab-track'

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <TopNav
                title="Settings"
                searchPlaceholder="Search settings..."
            />

            <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">Platform Configuration</h1>
                    <p className="text-on-surface-variant mt-1 text-lg">
                        Manage your environment variables, security keys, and global tracking parameters.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Settings Nav */}
                    <div className="space-y-1">
                        {[
                            { icon: 'settings', label: 'API & Integration', active: true },
                            { icon: 'key', label: 'Test Keys', active: false },
                            { icon: 'bar_chart', label: 'Global Tracking', active: false },
                            { icon: 'manage_accounts', label: 'Account', active: false },
                        ].map((item) => (
                            <button
                                key={item.label}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors ${item.active
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-on-surface-variant hover:bg-surface-container-low'
                                    }`}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Right Settings Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* API Configuration */}
                        <div className="card p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>terminal</span>
                                </div>
                                <h2 className="text-xl font-bold text-on-surface font-headline">API Configuration</h2>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">
                                    Tracking Endpoint
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        readOnly
                                        value={TRACKING_ENDPOINT}
                                        className="flex-1 px-4 py-3 rounded-xl bg-surface-container-low text-sm font-mono text-on-surface border-0 outline-none"
                                    />
                                    <button className="btn-primary px-5 py-3 text-sm font-semibold">
                                        Test Endpoint
                                    </button>
                                </div>
                            </div>

                            {/* GHL Integration snippet */}
                            <div className="mt-6">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">
                                    GHL Funnel JavaScript Snippet
                                </label>
                                <p className="text-sm text-on-surface-variant mb-4">
                                    Inject this tracking code sequentially on your pages. Use <code>page_view</code> and <code>cta_click</code> on landing pages, and trigger the <code>purchase</code> event exclusively on the order confirmation / thank you page. <strong>Do not inject into core checkout logic.</strong>
                                </p>
                                <div className="bg-[#1a1f2e] rounded-xl p-4 overflow-x-auto">
                                    <pre className="text-xs text-slate-300 font-mono leading-relaxed">{`fetch('${TRACKING_ENDPOINT}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    // Core KPIs: 'page_view', 'cta_click', 'purchase'
    event: 'purchase',
    test_key: 'nad_headline_test_v1',
    variant: localStorage.getItem('ab_variant') || 'A',
    page_path: window.location.pathname,
    page_url: window.location.href,
    revenue_value: 97.00, // Optional tracking
    timestamp: new Date().toISOString(),
  })
})`}</pre>
                                </div>
                            </div>
                        </div>

                        {/* Test Key Management */}
                        <div className="card p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>key</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-on-surface font-headline">Test Key Management</h2>
                                </div>
                                <button className="flex items-center gap-1.5 text-primary font-semibold text-sm hover:opacity-70 transition-opacity">
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_circle</span>
                                    Create New Key
                                </button>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { label: 'Production Master Key', value: 'pk_live_4e5c8...2f1', icon: 'lock' },
                                    { label: 'Staging Sandbox Key', value: 'pk_test_9a1b2...7d4', icon: 'person' },
                                ].map((key) => (
                                    <div
                                        key={key.label}
                                        className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center">
                                                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '16px' }}>
                                                    {key.icon}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-on-surface">{key.label}</p>
                                                <p className="text-xs font-mono text-on-surface-variant mt-0.5">{key.value}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors">
                                                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '16px' }}>content_copy</span>
                                            </button>
                                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors">
                                                <span className="material-symbols-outlined text-red-400" style={{ fontSize: '16px' }}>delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tracking Status + Account */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tracking Status */}
                            <div className="card p-8">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>hub</span>
                                    </div>
                                    <h2 className="text-lg font-bold text-on-surface font-headline">Tracking Status</h2>
                                </div>
                                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                                    Toggle global tracking for all active experiments. Disabling this will immediately stop data collection across all connected clients.
                                </p>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low">
                                    <span className="text-sm font-semibold text-on-surface">Global Tracking</span>
                                    {/* Toggle switch */}
                                    <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Account Settings */}
                            <div className="card p-8">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>account_circle</span>
                                    </div>
                                    <h2 className="text-lg font-bold text-on-surface font-headline">Account Settings</h2>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1.5">
                                            Profile Name
                                        </label>
                                        <input
                                            defaultValue="Alex Rivera"
                                            className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-on-surface border-0 outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1.5">
                                            Organization Email
                                        </label>
                                        <input
                                            defaultValue="alex@company.io"
                                            className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-on-surface border-0 outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <button className="w-full py-3 bg-surface-container-high text-on-surface font-semibold rounded-xl text-sm hover:bg-surface-container transition-colors">
                                        Update Profile
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-red-600 font-headline">Danger Zone</h3>
                                    <p className="text-sm text-red-500 mt-1">Permanently delete this organization and all experimental data.</p>
                                </div>
                                <button className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 transition-colors">
                                    Delete Everything
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
