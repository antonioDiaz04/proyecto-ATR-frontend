import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-principal',
  templateUrl: './header-principal.component.html',
  // styleUrl: './header-principal.component.scss'
})
export class HeaderPrincipalComponent {
  isLoggedIn = !!localStorage.getItem('token'); // Verificar si el token existe
  menuOpen = false;
  fechaTexto!: string;
  // fechaSeleccionada: Date;

  currentDate: Date = new Date();

  admin = {
    nombre: 'EDUARDO',
    apellidos: 'CASTRO HERNANDEZ',
    email: '20221076@uthh.edu.mx',
    _id: '67dd9094ece929a0fadc7fa9',
    rol: 'ADMIN',
    fechaDeRegistro: new Date('2025-03-21T16:15:16.075Z'),
    estadoCuenta: {
      estado: 'activa',
    },
  };

  fotoDePerfil =
    'https://res.cloudinary.com/dvvhnrvav/image/upload/v1743966796/ezr1m0ntipaqmsz8amsu.jpg';

  toggleMenu(event?: Event): void {
    if (event) event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  obtenerFechaTexto(): string {
    const fecha = new Date();
    const opciones: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return fecha.toLocaleDateString('es-ES', opciones);
  }

  constructor(private router: Router) {}

  ngOnInit() {
    // Actualizar la fecha cada minuto
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }

  redirectTo(route: string): void {
    this.menuOpen = false;
    // Lógica de redirección aquí
    this.router.navigate(['/admin/configuracion/perfil-administrador']);
  }

  logout() {
    localStorage.removeItem('token');
    this.menuOpen = false;
    this.router.navigate(['/']);

    // Redirigir al usuario o realizar acciones posteriores al logout
  }
}
