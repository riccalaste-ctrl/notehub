/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neu: {
          base: '#E0E5EC',
          surface: '#E0E5EC',
          light: '#FFFFFF',
          dark: 'rgba(163, 177, 198, 0.6)',
        },
        foreground: {
          DEFAULT: '#3D4F5F',
          light: '#6B7B8C',
          muted: '#8A9AAF',
        },
        mint: {
          DEFAULT: '#A8D5BA',
          dark: '#7AB89A',
          light: '#BFE3CC',
        },
        lavender: {
          DEFAULT: '#FF8C42',
          dark: '#E8700',
          light: '#FFA564',
        },
        coral: {
          DEFAULT: '#FFB5A0',
          dark: '#FF9478',
          light: '#FFA288',
        },
        stone: {
          50: '#F0F2F5',
          100: '#E0E5EC',
          200: '#CDD3DC',
          300: '#B8C0CC',
          400: '#A3B1C6',
          500: '#8A9AAF',
          600: '#6B7B8C',
          700: '#556677',
          800: '#3D4F5F',
          900: '#2D3748',
        },
      },
      borderRadius: {
        'neu': '24px',
        'neu-lg': '32px',
        'neu-xl': '40px',
        'neu-sm': '16px',
      },
      transitionTimingFunction: {
        'neu': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      fontFamily: {
        'sans': ['Inter', 'Geist', 'SF Pro Display', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'neu': '8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px #FFFFFF',
        'neu-lg': '12px 12px 24px rgba(163, 177, 198, 0.6), -12px -12px 24px #FFFFFF',
        'neu-xl': '16px 16px 32px rgba(163, 177, 198, 0.8), -16px -16px 32px #FFFFFF',
        'neu-hover': '12px 12px 24px rgba(163, 177, 198, 0.8), -12px -12px 24px #FFFFFF',
        'neu-hover-xl': '20px 20px 40px rgba(163, 177, 198, 0.8), -20px -20px 40px #FFFFFF',
        'neu-pressed': 'inset 4px 4px 8px rgba(163, 177, 198, 0.6), inset -4px -4px 8px #FFFFFF',
        'neu-pressed-lg': 'inset 6px 6px 12px rgba(163, 177, 198, 0.6), inset -6px -6px 12px #FFFFFF',
        'neu-sidebar': '8px 0 24px rgba(163, 177, 198, 0.6), -8px 0 24px #FFFFFF',
        'neu-badge': '2px 2px 6px rgba(163, 177, 198, 0.6), -2px -2px 6px #FFFFFF',
        'mint': '0 8px 24px rgba(168,213,186,0.4)',
        'lavender': '0 8px 24px rgba(184,164,227,0.35)',
        'coral': '0 8px 24px rgba(255,181,160,0.45)',
      },
    },
  },
  plugins: [],
};
