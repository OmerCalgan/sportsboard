import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#1A202C',      // Dark Charcoal
        'surface': '#2D3748',       // Card/Component Background
        'primary': '#34D399',       // Energetic Green (for buttons & highlights)
        'primary-hover': '#2CB889', // Darker green for hover
        'text-main': '#F7FAFC',     // Lightest text
        'text-muted': '#A0AEC0',    // Muted/secondary text
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [],
}

export default config
