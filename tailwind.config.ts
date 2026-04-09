/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // --- Design System: "The Precision-Layered Dashboard" ---
                // Core Brand
                'primary': '#3525cd',
                'primary-container': '#4f46e5',
                'on-primary': '#ffffff',
                'on-primary-container': '#dad7ff',
                'primary-fixed': '#e2dfff',
                'primary-fixed-dim': '#c3c0ff',
                'on-primary-fixed': '#0f0069',
                'on-primary-fixed-variant': '#3323cc',
                'inverse-primary': '#c3c0ff',

                // Secondary
                'secondary': '#58579b',
                'on-secondary': '#ffffff',
                'secondary-container': '#b6b4ff',
                'on-secondary-container': '#454386',
                'secondary-fixed': '#e2dfff',
                'secondary-fixed-dim': '#c3c0ff',
                'on-secondary-fixed': '#140f54',
                'on-secondary-fixed-variant': '#413f82',

                // Tertiary
                'tertiary': '#7e3000',
                'on-tertiary': '#ffffff',
                'tertiary-container': '#a44100',
                'on-tertiary-container': '#ffd2be',
                'tertiary-fixed': '#ffdbcc',
                'tertiary-fixed-dim': '#ffb695',
                'on-tertiary-fixed': '#351000',
                'on-tertiary-fixed-variant': '#7b2f00',

                // Surface Hierarchy (No-Line Rule)
                'background': '#faf8ff',
                'on-background': '#131b2e',
                'surface': '#faf8ff',
                'surface-dim': '#d2d9f4',
                'surface-bright': '#faf8ff',
                'surface-container-lowest': '#ffffff',
                'surface-container-low': '#f2f3ff',
                'surface-container': '#eaedff',
                'surface-container-high': '#e2e7ff',
                'surface-container-highest': '#dae2fd',
                'surface-variant': '#dae2fd',
                'on-surface': '#131b2e',
                'on-surface-variant': '#464555',
                'inverse-surface': '#283044',
                'inverse-on-surface': '#eef0ff',
                'surface-tint': '#4d44e3',

                // Outline
                'outline': '#777587',
                'outline-variant': '#c7c4d8',

                // Error
                'error': '#ba1a1a',
                'on-error': '#ffffff',
                'error-container': '#ffdad6',
                'on-error-container': '#93000a',
            },
            borderRadius: {
                'DEFAULT': '0.25rem',
                'sm': '0.25rem',
                'md': '0.375rem',
                'lg': '0.5rem',
                'xl': '0.75rem',
                '2xl': '1.5rem',
                'full': '9999px',
            },
            fontFamily: {
                'headline': ['Manrope', 'sans-serif'],
                'body': ['Inter', 'sans-serif'],
                'label': ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'ambient': '0 32px 64px -12px rgba(19, 27, 46, 0.08)',
                'ambient-sm': '0 8px 32px -4px rgba(19, 27, 46, 0.06)',
                'primary': '0 12px 40px -8px rgba(53, 37, 205, 0.35)',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #3525cd, #4f46e5)',
            },
        },
    },
    plugins: [],
}
