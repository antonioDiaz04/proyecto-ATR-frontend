import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  // styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {
  showMobileSidebar: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkIfMobile();
  }

  // Detecta redimensionamiento de pantalla
  @HostListener('window:resize')
  onResize() {
    this.checkIfMobile();
  }

  checkIfMobile(): void {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      this.showMobileSidebar = false; // Siempre la cierra al entrar desde móvil
    }
    // En escritorio se mantiene el comportamiento manual
  }

  mostrarSidebar() {
    this.showMobileSidebar = !this.showMobileSidebar;
  }

  redirectToCliente(route: string): void {
    this.router.navigate(['/cuenta', route]);
    this.showMobileSidebar = false; // Cierra la sidebar después de navegar
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/inicio']);
    this.showMobileSidebar = false;
  }
}
