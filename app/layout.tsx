import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: { default: 'A/B Testing Dashboard', template: '%s | AB Dashboard' },
    description: 'Track and optimize NAD+ funnel performance with real-time A/B testing analytics.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body suppressHydrationWarning className="bg-background text-on-surface antialiased">
                {children}
            </body>
        </html>
    )
}
