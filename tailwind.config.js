import tailwindcssAnimate from 'tailwindcss-animate'

export default {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '400px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      backgroundImage: {
        'auth-bg': "url('/images/bgggg.jpg')",
      },
      colors: {
        "variable-collection-neutral-2": "var(--variable-collection-neutral-2)",
        "variable-collection-neutral-3": "var(--variable-collection-neutral-3)",
        "variable-collection-neutrals": "var(--variable-collection-neutrals)",
        "variable-collection-PRIMARY-COLOR": "var(--variable-collection-PRIMARY-COLOR)",
        "variable-collection-primary-color-2": "var(--variable-collection-primary-color-2)",
        "variable-collection-secondary-color": "var(--variable-collection-secondary-color)",
        "variable-collection-secondary-color-duplicate": "var(--variable-collection-secondary-color-duplicate)",
        "system-colors-colors-green": "var(--system-colors-colors-green)",
        "brand-primary": "#3A599C",
        "brand-secondary": "#000000",
        "brand-neutral": "#F5F5F5",
      },
      fontFamily: {
        body: "var(--body-font-family)",
        "body-regular": "var(--body-regular-font-family)",
        head: "var(--head-font-family)",
        "head-2": "var(--head-2-font-family)",
        "sub-head": "var(--sub-head-font-family)",
        top: "var(--top-font-family)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
