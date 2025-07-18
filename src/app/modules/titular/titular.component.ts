import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-titular',
  templateUrl: './titular.component.html',
})
export class TitularComponent {
  menuAbierto: boolean = false;
  isCollapsed: boolean = false;
  modoOscuroActivo = false;

  @ViewChild('sidebarRef') sidebarRef!: ElementRef;
  @ViewChild('menuToggleRef') menuToggleRef!: ElementRef;

  constructor(private router: Router) {}

  ngOnInit() {
    this.modoOscuroActivo = localStorage.getItem('modoOscuro') === 'true';
    this.actualizarModo();
  }

  alternarModoOscuro() {
    this.modoOscuroActivo = !this.modoOscuroActivo;
    localStorage.setItem('modoOscuro', this.modoOscuroActivo.toString());
    this.actualizarModo();
  }

  actualizarModo() {
    const root = document.documentElement;
    if (this.modoOscuroActivo) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  redirectTo(path: string) {
    console.log(`Redirigiendo a: /titular/${path}`);
    this.router.navigate(['/titular/', path]);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/inicio']);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const clickedInsideSidebar =
      this.sidebarRef?.nativeElement.contains(target);
    const clickedMenuToggle =
      this.menuToggleRef?.nativeElement.contains(target);

    if (
      this.menuAbierto &&
      !clickedInsideSidebar &&
      !clickedMenuToggle &&
      window.innerWidth < 768
    ) {
      this.menuAbierto = false;
    }
  }
}
