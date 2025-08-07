import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        luxury: {
          DEFAULT: '#1F1C1C',
          light: '#FAFAFA',
          card: {
            DEFAULT: '#2C2423',
            light: '#FFFFFF',
          },
          accent: {
            DEFAULT: '#C9A37A',
            light: '#D4AF7A',
          },
          gold: '#D4AF7A',
          text: {
            DEFAULT: '#F5F5F5',
            light: '#0F0E0E',
          },
          subtext: {
            DEFAULT: '#BFB5B2',
            light: '#6B6463',
          },
        },
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'luxury': '0 4px 20px -2px rgba(201, 163, 122, 0.15)',
        'luxury-light': '0 4px 20px -2px rgba(201, 163, 122, 0.08)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};

export default config; 