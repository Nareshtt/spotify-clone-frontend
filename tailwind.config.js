/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        satoshi: ['Satoshi-Regular', 'sans-serif'],
        'satoshi-black': ['Satoshi-Black', 'sans-serif'],
        'satoshi-blackitalic': ['Satoshi-BlackItalic', 'sans-serif'],
        'satoshi-bold': ['Satoshi-Bold', 'sans-serif'],
        'satoshi-bolditalic': ['Satoshi-BoldItalic', 'sans-serif'],
        'satoshi-italic': ['Satoshi-Italic', 'sans-serif'],
        'satoshi-light': ['Satoshi-Light', 'sans-serif'],
        'satoshi-lightitalic': ['Satoshi-LightItalic', 'sans-serif'],
        'satoshi-medium': ['Satoshi-Medium', 'sans-serif'],
        'satoshi-mediumitalic': ['Satoshi-MediumItalic', 'sans-serif'],
      },
      colors: {
        primary: '#FF7F00',
        fg: {
          primary: '#E0E0E0',
          secondary: '#898989',
          tertiary: '#323232',
        },
        bg: {
          primary: '#111111',
          secondary: '#202020',
          main: '#060606',
          player: '#333842',
        },
      },
    },
  },
  plugins: [],
};
