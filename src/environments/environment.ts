export const environment = {
  production: false,
  api: 'https://proyecto-atr-backend.onrender.com/api/v1', //!alojado
  // api: 'http://localhost:4000/api/v1', //!Local
  serviceWorker: true,

  publicKey:
    'BFbYJL0v_jPOzh1TT4yK9-waY7QsGVtq1F1DQHUZdFa3bJRvlZQYZiRKpMjKap20Ch3M2r1r0rxtIHw15ydzLHY',
  privateKey: 'D-FwNDZuOjO0oIoepPSqrp4LdKG98lBYiRgqXtA7tCo',
  //para la autenticacion con firebase
  firebaseConfig: {
    apiKey: 'AIzaSyB1qHkNRaakPbvjccyQjs49fHf5MH1HGPU',
    authDomain: 'atelier-bd93b.firebaseapp.com',
    projectId: 'atelier-bd93b',
    storageBucket: 'atelier-bd93b.firebasestorage.app',
    messagingSenderId: '452411722311',
    appId: '1:452411722311:web:eafb14f82195652909bf62',
    measurementId: 'G-Z85LGNMKKZ',
  },
};
