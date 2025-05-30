import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
// import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SessionService } from "../../../../shared/services/session.service";
import { ClientesService } from "../../../../shared/services/clientes.service";
import { MenuItem } from "primeng/api";
import { StorageService } from "../../../../shared/services/storage.service";
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: `
  .nav-link.active {
    border-bottom: 1px solid red; /* Línea inferior naranja para el enlace activo */
    color: #000; /* Color de texto negro para el enlace activo */
    border-radius:0;
    // padding: 5px; /* Espaciado interno para mejor apariencia */
  }
  `,
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
  openSubmenu: string | null = null;
  activeLink: HTMLElement | null = null;
  mostrarCalendario: boolean = false;

  isCollapsed = false;
  selectedLink: string = '';

  fechaSeleccionada: Date;
  id!: string;
  data: any = {};
  @ViewChild('seccionVista') seccionVista!: ElementRef;

  constructor(
    private storageService: StorageService,
    private clientesService: ClientesService,
    private router: Router,
    private renderer: Renderer2,
    private sessionService: SessionService,
  ) {
    this.fechaSeleccionada = new Date();
  }

  isResizing: boolean = false;

  sidebarWidth = 250; // Ancho inicial del menú en píxeles
  resizing = false; // Bandera para indicar si está en proceso de redimensionamiento

  ngOnInit() {}

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.resizing) {
      this.sidebarWidth = event.clientX;
    }
  }
  @HostListener('document:mouseup')
  stopResizing() {
    this.resizing = false;
  }

  resizeSidebar(event: MouseEvent) {
    if (this.isResizing) {
      const newWidth = event.clientX;
      const minWidth = 250;
      const maxWidth = 600;

      const finalWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
      this.renderer.setStyle(
        document.querySelector('.w-30rem'),
        'width',
        `${finalWidth}px`
      );
    }
  }

  logout() {
    this.storageService.removeItem('token');
    this.router.navigate(["/"]);
  }

  isLoggedIn = !!localStorage.getItem('token');
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  hoverEnabled = true;

  onMouseEnter() {
    if (this.hoverEnabled && this.isCollapsed) {
      this.isCollapsed = false;
    }
  }

  onMouseLeave() {
    if (this.hoverEnabled && !this.isCollapsed) {
      this.isCollapsed = true;
    }
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  selectLink(link: string) {
    this.selectedLink = link;
  }
}
