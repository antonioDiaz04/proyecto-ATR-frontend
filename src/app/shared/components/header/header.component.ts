import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
  ElementRef,
  ChangeDetectionStrategy,
  signal,
  Input,
  SimpleChanges,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService, ProductoService],
})
export class HeaderComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isMobile = false;

  busquedaProducto: string = '';
  mostrarDropdown: boolean = false;
  productosFiltrados: any[] = [];
  todosLosProductos!: any[];
  isLoading: boolean = false;
  isScrolled: boolean = false; // Añadido para el efecto de scroll
  isSticky: boolean = false; // Añadido para el efecto de scroll
  sidebarVisible: boolean = false; // Añadido para el menú lateral
  isLoggedIn: boolean = false; // Variable para simular el estado de inicio de sesión
  userMenuOpen: boolean = false; // Para el menú de usuario en desktop
  isModalVisible: boolean = false; // Para el modal de login
// Para el menú dinámico
menuItems = [
  { label: 'Inicio', icon: 'pi pi-home', route: 'inicio' },
  { label: 'Nuestra colección', icon: 'pi pi-search', route: 'search' },
  { label: 'Nuevos Arrivos', icon: 'pi pi-star', route: 'Nuevos', badge: 'NEW' },
  { label: 'Vestidos por Ocasión', icon: 'pi pi-calendar', route: 'vestidos-por-ocasion' },
  { label: 'Recomendaciones', icon: 'pi pi-sparkles', route: 'recomendaciones' },
  { label: 'Acompleta tu look', icon: 'pi pi-shopping-bag', route: 'look' },
  { label: 'Cita de probador', icon: 'pi pi-calendar-plus', route: 'CitasProbador' }
];

bottomLinks = [
  { label: 'Sobre Nosotros', icon: 'pi pi-info-circle', route: 'sobre-nosotros' },
  { label: 'Preguntas Frecuentes', icon: 'pi pi-question-circle', route: 'preguntas-frecuentes' },
  { label: 'Términos y Condiciones', icon: 'pi pi-file', route: 'terminos' },
  { label: 'Políticas de Privacidad', icon: 'pi pi-lock', route: 'politicas' }
];
  private cartSubscription!: Subscription;

  constructor(
    private PRODUCTOSERVICE_: ProductoService,
    private router: Router,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {}

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.isScrolled = window.scrollY > 50;
    this.isSticky = window.scrollY > 50;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isMobile']) {
      // Código para manejar el cambio en isMobile si es necesario
    }
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.cargarProductos();
    // Simulación del estado de login, lo ideal es obtenerlo de un servicio de autenticación
    this.isLoggedIn = false;
  }

  cargarProductos() {
    this.isLoading = true;
    this.PRODUCTOSERVICE_.obtenerProductos().subscribe(
      (response) => {
        this.todosLosProductos = response;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al cargar los productos:', error);
        this.isLoading = false;
      }
    );
  }

  limpiarBusqueda(): void {
    this.busquedaProducto = '';
    this.productosFiltrados = [];
    this.mostrarDropdown = false;
  }

  filtrarProductos(): void {
    const texto = this.busquedaProducto.trim().toLowerCase();
    if (!texto) {
      this.productosFiltrados = this.todosLosProductos;
      return;
    }

    this.productosFiltrados = this.todosLosProductos.filter((p) => {
      const searchableText = `${p.nombre || ''} ${p.color || ''} ${p.talla || ''} ${p.tipoCuello || ''} ${p.tipoCola || ''} ${p.tipoCapas || ''} ${p.tipoHombro || ''} ${p.precioActual || ''} ${p.precioAnterior || ''}`.toLowerCase();
      return searchableText.includes(texto);
    });
  }

  resaltarCoincidencia(texto: string): SafeHtml {
    const query = this.busquedaProducto.trim();
    if (!query || !texto) {
      return texto;
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const result = texto.replace(regex, '<b>$1</b>');

    return this.sanitizer.bypassSecurityTrustHtml(result);
  }

  seleccionarProducto(producto: any): void {
    this.busquedaProducto = producto.nombre;
    this.mostrarDropdown = false;
    this.router.navigate(['/Detail/' + producto._id]);
  }

  ocultarDropdownConRetraso(): void {
    setTimeout(() => {
      this.mostrarDropdown = false;
    }, 200);
  }

  // Métodos adicionales del HTML
  redirectTo(route: string) {
    this.router.navigate([`/${route}`]);
    this.sidebarVisible = false; // Cierra el menú en móvil
  }

  redirectToCliente(route: string) {
    // Lógica de redirección a páginas de cliente
    console.log(`Redireccionando a /cliente/${route}`);
  }

  logout() {
    this.isLoggedIn = false;
    console.log('Sesión cerrada');
    // Lógica para cerrar sesión
  }

  showDialog() {
    this.sidebarVisible = true;
  }

  openModal() {
    this.isModalVisible = true;
  }

  cerrarModal(event: boolean) {
    this.isModalVisible = event;
  }

  dressItemCount(): number {
    // Lógica para obtener el número de items en el carrito
    return 0;
  }
}