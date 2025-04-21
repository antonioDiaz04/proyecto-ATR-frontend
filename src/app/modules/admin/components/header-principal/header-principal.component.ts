import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-principal',
  templateUrl: './header-principal.component.html',
  styleUrl: './header-principal.component.scss'
})
export class HeaderPrincipalComponent {
  isLoggedIn = !!localStorage.getItem('token'); // Verificar si el token existe
  menuOpen = false;
  
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }


  constructor(private router:Router){}
  
  logout() {
    localStorage.removeItem('token');
    this.menuOpen = false;
    this.router.navigate(["/inicio"]);

    // Redirigir al usuario o realizar acciones posteriores al logout
  }
  
}
