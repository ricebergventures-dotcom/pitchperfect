import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        rb: {
          cyan: '#61D1DC',
          'cyan-light': '#B4E9E9',
          charcoal: '#242424',
          card: '#111111',
          border: '#1e1e1e',
        },
      },
      fontFamily: {
        raleway: ['Raleway', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'rb-gradient': 'linear-gradient(90deg, #ffffff 35.31%, #b4e9e9 100%)',
        'rb-gradient-cyan': 'linear-gradient(135deg, #61D1DC, #B4E9E9)',
      },
    },
  },
  plugins: [],
};
export default config;
