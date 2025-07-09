// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff9f1',
          100: '#fef4e9',
          200: '#fde6d7',
          300: '#fbd3b5',
          400: '#f9c196',
          500: '#f7b077',
          600: '#f59d58',
          700: '#f38a39',
          800: '#f1771a',
          900: '#ef6400',
        },
      },
    },
  },
  plugins: [],
};
