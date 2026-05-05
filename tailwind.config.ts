/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#050505',
        surface: '#111111',
        surfaceHover: '#1a1a1a',
        foreground: {
          DEFAULT: '#f8f9fa',
          light: '#adb5bd',
          muted: '#6c757d',
        },
        neon: {
          purple: '#9d4edd',
          blue: '#4361ee',
          pink: '#f72585',
          cyan: '#4cc9f0',
          orange: '#ff7900',
          green: '#06d6a0',
        },
        // Keep these for backward compatibility if missed during find/replace
        neu: {
          base: '#050505',
          surface: '#111111',
          light: '#222222',
          dark: '#000000',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        'mesh-pattern': 'radial-gradient(at 40% 20%, hsla(280,100%,74%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.1) 0px, transparent 50%)',
      },
      borderRadius: {
        'neu': '24px',
        'neu-lg': '32px',
        'neu-xl': '40px',
        'neu-sm': '16px',
        'glass': '24px',
        'glass-lg': '32px',
        'glass-xl': '40px',
        'glass-sm': '16px',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      fontFamily: {
        'sans': ['Inter', 'Geist', 'SF Pro Display', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
        'neon-purple': '0 0 20px rgba(157, 78, 221, 0.4)',
        'neon-blue': '0 0 20px rgba(67, 97, 238, 0.4)',
        'neon-orange': '0 0 20px rgba(255, 121, 0, 0.4)',
        // Backwards compat overrides
        'neu': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neu-lg': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'neu-xl': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'neu-hover': '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
        'neu-pressed': 'inset 0 2px 10px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};
