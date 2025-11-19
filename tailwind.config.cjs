/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './App.tsx',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 20s linear infinite'
      },
      backgroundImage: {
        'vinyl-gradient': 'repeating-radial-gradient(#18181b 0, #18181b 2px, #09090b 3px, #09090b 4px)'
      },
      colors: {
        'vinyl-black': '#050505',
        'vinyl-groove': '#1c1c1c'
      }
    }
  },
  plugins: []
}

