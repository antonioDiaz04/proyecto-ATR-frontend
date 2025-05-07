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
  // styleUrls: ['./header.component.scss', "menuLateral.scss"],

  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
  openSubmenu: string | null = null;
  activeLink: HTMLElement | null = null;
  mostrarCalendario: boolean = false;
  fecha: string;
  fechaTexto: string;
  fechaSeleccionada: Date;
  id!: string;
  data: any = {};
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;

  @ViewChild('seccionVista') seccionVista!: ElementRef;

  constructor(
    private storageService: StorageService,
    private clientesService: ClientesService,
    private router: Router,
    private renderer: Renderer2,
    private sessionService: SessionService,
  ) {
    this.fechaSeleccionada = new Date();
    this.fecha = this.obtenerFechaYYYYMMDD();
    this.fechaTexto = this.obtenerFechaTexto();
  }



  isResizing: boolean = false;


  isCollapsed = false;

  sidebarWidth = 250; // Ancho inicial del menú en píxeles
  resizing = false; // Bandera para indicar si está en proceso de redimensionamiento

  ngOnInit() {
    // this.getData();
    this.items = [
      { label: 'Electronics' },
      { label: 'Computer' },
      { label: 'Accessories' },
      { label: 'Keyboard' },
      { label: 'Wireless' }
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/' };
  }

  // Método que se dispara al pasar el cursor sobre el menú lateral
  onSidenavMouseEnter(): void {
    if (this.isCollapsed) {
      // Abre el menú y remueve la clase de padding colapsado
      this.isCollapsed = false;
      this.renderer.removeClass(document.body, 'collapsed-padding');
    }
  }

  // Método que se dispara al salir el cursor del menú lateral
  onSidenavMouseLeave(): void {
    if (!this.isCollapsed) {
      // Colapsa el menú y agrega la clase de padding colapsado
      this.isCollapsed = true;
      this.renderer.addClass(document.body, 'collapsed-padding');
    }
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.renderer.addClass(document.body, 'collapsed-padding');
    } else {
      this.renderer.removeClass(document.body, 'collapsed-padding');
    }
  }


  // Inicia el redimensionamiento
  startResizing(event: MouseEvent) {
    this.resizing = true;
    event.preventDefault();
  }

  // Detecta el movimiento del ratón mientras redimensiona
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.resizing) {
      this.sidebarWidth = event.clientX; // Ajusta el ancho del menú según la posición del ratón
    }
  }
  @HostListener('document:mouseup')
  stopResizing() {
    this.resizing = false;
  }



  resizeSidebar(event: MouseEvent) {
    if (this.isResizing) {
      const newWidth = event.clientX; // Calcula el nuevo ancho según la posición del mouse
      const minWidth = 250; // Puedes ajustar el ancho mínimo
      const maxWidth = 600; // Ajusta el ancho máximo

      // Limita el ancho a un rango
      const finalWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
      this.renderer.setStyle(
        document.querySelector('.w-30rem'),
        'width',
        `${finalWidth}px`
      );
    }
  }




  isTextVisible: boolean = true; // Se puede ocultar o mostrar

  mostrar() {
    // this.openSubmenu = this.openSubmenu === submenu ? null : submenu;
    this.isTextVisible = !this.isTextVisible; // Cambia la visibilidad del texto
  }


  // isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }


  toggleCalendar() {
    this.mostrarCalendario = !this.mostrarCalendario;
  }



  setActiveLink(event: Event): void {
    const target = event.currentTarget as HTMLElement;
    if (this.activeLink) {
      this.activeLink.classList.remove("m-tree__itemContent__selected");
    }
    target.classList.add("m-tree__itemContent__selected");
    this.activeLink = target;
  }

  toggleSubmenu(submenuId: string) {
    this.openSubmenu = this.openSubmenu === submenuId ? null : submenuId;
  }



  logout() {
    this.storageService.removeItem('token');
    this.router.navigate(["/auth/login"]);
  }

  redirectToCotrolClientes(route: string): void {
    this.router.navigate([route === "login" ? "/auth/login" : `/admin/control-clientes/${route}`]);
  }

  redirectToProductos(route: string): void {
    this.router.navigate([route === "login" ? "/auth/login" : `/admin/control-productos/${route}`]);
  }
  redirectToAccesorios(route: string): void {
    this.router.navigate([route === "login" ? "/auth/login" : `/admin/${route}`]);
  }
  redirectToCategorias(ruta: string): void {
    this.router.navigate([`/admin/${ruta}`]);
  }
  redirectToAccesoriosYvestidos(route: string): void {
    this.router.navigate([route === "login" ? "/auth/login" : `/admin/control-asignar-acs-vestido-renta/${route}`]);
  }
  redirectToAccesoriosRenta(route: string): void {
    this.router.navigate([route === "login" ? "/auth/login" : `/admin/${route}`]);
  }

  redirectToRenta(route: string): void {
    this.router.navigate([route === "login" ? "/auth/login" : `/admin/control-renta/${route}`]);
  }

  redirectToReportes(route: string): void {
    this.router.navigate([route === "login" ? "/auth/login" : `/admin/reportes/${route}`]);
  }
  redirectToConfiguracion(route: string): void {
    this.router.navigate([route === "login" ? "/auth/login" : `/admin/configuracion/${route}`]);
  }

  redirectToVentas(route: string): void {
    this.router.navigate([route === "login" ? "/auth/login" : `/admin/control-venta/${route}`]);
  }
  redirectoPoliticas(route: string): void {
    this.router.navigate([route === "login" ? "/auth/login" : `/admin/politicas/${route}`]);
  }

  obtenerFechaYYYYMMDD() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${dia}-${mes}-${año}`;
  }

  obtenerFechaTexto() {
    const diasSemana = [
      "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
    ];
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const fecha = new Date();
    const diaSemana = diasSemana[fecha.getDay()];
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    return `${diaSemana} / ${mes} / ${año}`;
  }




  isLoggedIn = !!localStorage.getItem('token'); // Verificar si el token existe
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

}
