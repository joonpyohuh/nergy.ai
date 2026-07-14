/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        toss: {
          blue: '#3182F6',
          dark: '#191F28',
          text: '#333D4B',
          muted: '#8B95A1',
          line: '#E5E8EB',
          surface: '#F2F4F6',
        },
      },
      boxShadow: {
        soft: '0 8px 30px rgba(25, 31, 40, 0.06)',
        card: '0 1px 2px rgba(25, 31, 40, 0.04), 0 8px 24px rgba(25, 31, 40, 0.04)',
      },
      animation: {
        'fade-up': 'fadeUp .45s cubic-bezier(.2,.8,.2,1) both',
        'pulse-soft': 'pulseSoft 1.8s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(49,130,246,.12)' },
          '50%': { boxShadow: '0 0 0 10px rgba(49,130,246,0)' },
        },
      },
    },
  },
  plugins: [],
}
