/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
extend: {
  colors: {
    primary: "#1e40af", // deep blue
    navy: "#0b1a33",    // dark navy
    midnight: "#020617", // near black
    accent: "#2ecc71", // green for success/highlights
  },
},
  },
  plugins: [],
}