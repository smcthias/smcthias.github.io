/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#4a4a4a',
        // 2026 redesign tokens ("screening room to studio floor")
        ink: '#14171C',      // Bitumen: dark bands (hero, capacity, footer)
        gesso: '#F2EFE6',    // warm plaster white: daylight sections
        ultra: '#2B3FDE',    // Ultramarine: primary action, links, focus
        signal: '#E3A32F',   // Signal Amber: active states, stat marks on dark
        graphite: '#454E58', // body text on light
        putty: '#A79F8D',    // meta text on dark, muted labels
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serifa: ['Newsreader', 'Georgia', 'serif'],
        mono: ['"Spline Sans Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
