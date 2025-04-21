export const environment = {
  production: false,
  api: 'https://proyecto-atr-backend.onrender.com/api/v1', //!alojado
  // api: 'http://localhost:4000/api/v1', //!Local
  serviceWorker: true,
  publicKey:"BLYrs4NfSkkjBeVIMgH2ANO4Hcd3FrGKYXabe5L6jpURiePXV9cbl4IewwLjzdszahWAb8SaiPNmyMz6mywr6KY",
  privateKey:"keH3GwgD0noSJ7IHg_DLwMRP5WM8T0xlRRb2OG-bjFI",
  //para la autenticacion con firebase
  firebaseConfig : {
    apiKey: "AIzaSyB1qHkNRaakPbvjccyQjs49fHf5MH1HGPU",
    authDomain: "atelier-bd93b.firebaseapp.com",
    projectId: "atelier-bd93b",
    storageBucket: "atelier-bd93b.firebasestorage.app",
    messagingSenderId: "452411722311",
    appId: "1:452411722311:web:eafb14f82195652909bf62",
    measurementId: "G-Z85LGNMKKZ"
  }
};
