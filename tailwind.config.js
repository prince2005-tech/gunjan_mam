/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#0A241A',
          800: '#0E3426',
          700: '#123F2E', // Sidebar primary background
          600: '#184F3B',
          500: '#1D634B',
          400: '#23785B',
        },
        mint: {
          500: '#10B981',
          400: '#34D399', // Mint green highlight
          300: '#6EE7B7',
          200: '#A7F3D0',
          100: '#D1FAE5',
          50: '#F0FDF4',
        },
        municipal: {
          bg: '#F5F8F5', // Light clean workspace background
          card: '#FFFFFF',
          primary: '#16834A',
          hover: '#136F3F',
          mint: '#DDF5E5',
          sage: '#E8F3EA',
          teal: '#168A83',
          blue: '#E8F1FA',
          warning: '#F59E0B',
          error: '#DC4545',
          text: '#1F2937',
          muted: '#64748B',
          border: '#E2EAE2'
        }
      }
    },
  },
  plugins: [],
}
