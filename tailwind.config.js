/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ✅ allows toggling via a 'dark' class on <html> or <body>
  theme: {
    extend: {
      colors: {
        // 🎨 Optional: define your brand colors or custom accents
        accent: {
          DEFAULT: '#3B82F6', // blue-500
          hover: '#2563EB',   // blue-600
        },
        surface: {
          light: '#ffffff',
          dark: '#1f2937', // gray-800
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
