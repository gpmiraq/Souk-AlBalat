/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
      },
      colors: {
        carbon: {
          950: '#090D16',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        },
        amazon: {
          orange: '#FF9900',
          dark: '#131921',
          light: '#232F3E',
          blue: '#146EB4',
        },
        condition: {
          openbox: '#0EA5E9',
          gradeA: '#10B981',
          gradeB: '#F59E0B',
          refurbished: '#8B5CF6',
          asis: '#EF4444',
        }
      },
      boxShadow: {
        'glow-orange': '0 0 25px -5px rgba(255, 153, 0, 0.3)',
        'glow-cyan': '0 0 25px -5px rgba(14, 165, 233, 0.3)',
        'glow-green': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
      }
    },
  },
  plugins: [],
}
