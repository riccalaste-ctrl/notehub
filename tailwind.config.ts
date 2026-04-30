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
        sage: {
          DEFAULT: '#A8D5BA',
          dark: '#7AB89A',
          light: '#BFE3CC',
        },
        lavender: {
          DEFAULT: '#B8A4E3',
          dark: '#9580D4',
          light: '#C8B4F0',
        },
        peach: {
          DEFAULT: '#FFB5A0',
          dark: '#FF9478',
          light: '#FFA288',
        },
        stone: {
          50: '#F8F9FA',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#9CA3AF',
          600: '#6B7280',
          700: '#4B5563',
          800: '#2D3748',
          900: '#1a1a2e',
        },
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      fontFamily: {
        'sans': ['Inter', 'Geist', 'SF Pro Display', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)',
        'glass-sm': '0 4px 16px rgba(139,127,180,0.08)',
        'glass-lg': '0 16px 40px rgba(184,164,227,0.45), 0 8px 20px rgba(168,213,186,0.25)',
        'sage': '0 8px 24px rgba(168,213,186,0.4)',
        'lavender': '0 8px 24px rgba(184,164,227,0.35)',
        'peach': '0 8px 24px rgba(255,181,160,0.45)',
        'sidebar': '4px 0 30px rgba(139,127,180,0.08)',
      },
    },
  },
  plugins: [],
};
