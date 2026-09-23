/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        corporate: {
          primary: '#0284c7',
          'primary-content': '#ffffff',
          secondary: '#64748b',
          accent: '#0d9488',
          neutral: '#1e293b',
          'base-100': '#ffffff',
          'base-200': '#f8fafc',
          'base-300': '#e2e8f0',
          info: '#38bdf8',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
      'dark',
    ],
    darkTheme: 'dark',
    base: true,
    styled: true,
    utils: true,
  },
};
