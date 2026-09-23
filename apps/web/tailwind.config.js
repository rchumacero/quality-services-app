import sharedPreset from '@quality-services/config/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/utils/src/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [sharedPreset],
  theme: {
    extend: {},
  },
  plugins: [],
};
