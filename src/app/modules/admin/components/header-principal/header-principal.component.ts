import { Component } from '@angular/core';
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
  
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  obtenerFechaTexto(): string {
    const fecha = new Date();
    const opciones: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones);
  }

  constructor(private router:Router){}
  
  logout() {
    localStorage.removeItem('token');
    this.menuOpen = false;
    this.router.navigate(["/inicio"]);

    // Redirigir al usuario o realizar acciones posteriores al logout
  }
  
}
