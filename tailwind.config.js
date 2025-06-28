module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/smart-webcomponents-angular/**/*.{html,js}" // Si usas Smart WebComponents
  ],
  theme: {
    extend: {
      fontFamily: {
        romantic: ['"Have You Eaten"', 'cursive'], // nombre que usas en tu clase
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ]
}