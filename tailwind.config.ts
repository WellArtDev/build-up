import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0A0A0C',
        surface: '#111114',
        accent: '#CCFF00',
        'text-primary': '#FFFFFF',
        'text-secondary': '#9CA3AF',
        border: '#1F2937',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
      },
      maxWidth: {
        'fluid-sm': 'clamp(20rem, 50vw, 36rem)',
        'fluid-md': 'clamp(28rem, 70vw, 56rem)',
        'fluid-lg': 'clamp(40rem, 85vw, 80rem)',
        'fluid-xl': 'clamp(48rem, 90vw, 96rem)',
      },
    },
  },
  plugins: [],
};

export default config;
