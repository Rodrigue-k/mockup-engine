import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'f-base': '#0C0C0C',
        'f-surface': '#161616',
        'f-elevated': '#1F1F1F',
        'f-border': 'rgba(255,255,255,0.07)',
        'f-primary': '#F0F0F0',
        'f-secondary': '#888888',
        'f-accent': '#D0021B',
        'f-accent-hover': '#E8021F',
        studio: {
          bg: '#F9F9FB',
          card: '#FFFFFF',
          accent: '#3B82F6',
          secondary: '#8B5CF6',
          text: '#111827',
          muted: '#6B7280',
          border: '#E5E7EB',
        },
      },
      boxShadow: {
        studio: '0 20px 40px -15px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        studio: '1rem',
        'studio-xl': '1.5rem',
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
