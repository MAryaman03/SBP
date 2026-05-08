/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#d4a5a5',
        rose: '#c94e3a',
        platinum: '#e8d5b7',
        cream: '#f5f1e8',
        dark: '#1a1a1a',
      },
      fontFamily: {
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 0 30px rgba(212, 165, 165, 0.2)',
        'rose': '0 0 30px rgba(201, 78, 58, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
