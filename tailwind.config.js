// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './client/src/**/*.{js,jsx,ts,tsx,html}',
    './shared/**/*.{js,jsx,ts,tsx,html}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        // add any other CSS variables or literal colors you use
      },
    },
  },
  plugins: []
}