module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/smart-webcomponents-angular/**/*.{html,js}"
  ],
  theme: {
    extend: {
      fontFamily: {
        romantic: ['"Have You Eaten"', 'cursive'],
      },
      colors: {
        fondoOscuro: '#121313',
        mainOscuro: '#272b2e',
        sidebarOscuro: '#121212',
        textoClaro: '#F9FAFB',
        bordeOscuro: '#374151',

        seleccionadoClaro: '#515353',   // teal-500
        seleccionadoOscuro: '#515353',  // teal-400
        
        fondoTarjeta: '#161718',
        acento: '#6366F1',
        acentoHover: '#818CF8',
        fondoHover: '#2A2A2A',
        entradaFondo: '#1F2937',
        entradaBorde: '#4B5563',
        peligro: '#EF4444',
        advertencia: '#F59E0B',
        exito: '#10B981'
      }
    },
  },
  plugins: [],
}
