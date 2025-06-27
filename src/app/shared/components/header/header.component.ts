import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
  AfterViewInit,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal,
  Input,
  SimpleChanges,
  OnChanges,
  OnDestroy,
  effect,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ConfirmationService, MenuItem, MenuItemCommandEvent, MessageService } from 'primeng/api';
import { SessionService } from '../../services/session.service';
import { ERol } from '../../constants/rol.enum';
import { DatosEmpresaService } from '../../services/datos-empresa.service';
import { ThemeServiceService } from '../../services/theme-service.service';
import { CartService } from '../../services/cart.service';
import { IndexedDbService } from '../../../modules/public/commons/services/indexed-db.service';
import { Subscription } from 'rxjs';
import { LoginModalComponent } from '../login-modal/login-modal.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SidebarModule } from 'primeng/sidebar';
import { ToastModule } from 'primeng/toast';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ProductoService } from '../../services/producto.service';

declare const $: any;

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  // styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService,  ProductoService, ConfirmationService],
})
export class HeaderComponent implements OnInit, OnChanges, OnDestroy {
  isScrolled = false;
  sidebarVisible = false;
  @Input() isMobile = false;
  items: MenuItem[] = [];
  isLoggedIn = false;
  // Señal para manejar el contador
  dressItemCount!: any;
  userROL!: string;
  isSticky = false;
  searchQuery = ""; // Bind search input
  datosEmpresa: any = {};
  nombreDeLaPagina: string = "";
  dressItems: any[] = [];
  // Señal para manejar reactividad
  private dressItemsSignal = signal<any[]>([]);
  empresaData: any;
  private cartSubscription!: Subscription;
  imageUrl!: string;
  defaultImageUrl: string =
    "https://res.cloudinary.com/dvvhnrvav/image/upload/v1730395938/images-AR/wyicw2mh3xxocscx0diz.png";
  isDarkThemeOn = signal(false);

  showSuggestions: boolean = false;
  isLoading: boolean = false;

  // Categorías de búsqueda
  suggestions: string[] = ['Color', 'Cuello', 'Talla', 'Material', 'Diseño', 'Manga', 'Estampado'];
  filteredSuggestions: string[] = [];
  openRegisterModal() {

  }
  darkMode = false;
  constructor(
    private PRODUCTOSERVICE_: ProductoService,
    private indexedDbService: IndexedDbService,
    private ngxService: NgxUiLoaderService,
    private sessionService: SessionService,
    private datosEmpresaService: DatosEmpresaService,
    private elementRef: ElementRef,
    public themeService: ThemeServiceService,
    private cartService: CartService,
    private router: Router,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
this.updateMenuItems()
    // Usar la señal computada del servicio para el contador
    this.dressItemCount = this.cartService.dressItemCount;
    effect(() => {
      const items = this.cartService.getCartItems();
      if (items.length > 0) {
        this.showAlert('Se agregó un producto al carrito');
      }
    });
  }

  showAlert(message: string) {
    this.messageService.add({
      severity: 'info',
      summary: 'Notificación',
      detail: message,
    });
  }
  isModalVisible: boolean = false;

  openModal() {
    this.isModalVisible = true;
  }

  cerrarModal(valor: boolean): void {
    this.isModalVisible = valor; // Oculta el modal
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["mostrarFormulario"]) {
      const newVluesmostrarFormulario =
        changes["mostrarFormulario"].currentValue;
      this.isModalVisible = newVluesmostrarFormulario; // Actualizamos el valor para cerrar el modal

      console.log(
        "mostrarFormulario  en listado producto cambió a:",
        newVluesmostrarFormulario
      );
    }
    if (changes["isMobile"]) {
      this.onMobileChange(changes["isMobile"].currentValue);
    }
    this.dressItemsSignal.set(this.dressItems); // Actualiza la señal correctamente
    // Aquí puedes agregar lógica adicional si es necesario
  }
  ngOnDestroy() {
    // Desuscribirse para evitar fugas de memoria
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  busquedaProducto: string = '';
  mostrarDropdown: boolean = false;
  productosFiltrados: any[] = [];
  todosLosProductos!: any[];
  cargarProductos() {
    this.isLoading = true; // Mostrar el skeleton al cargar
    this.PRODUCTOSERVICE_.obtenerProductos().subscribe(
      (response) => {
        this.ngxService.stop(); // Inicia el loader

        // console.log("📦 Productos recibidos:");
        this.todosLosProductos = response;
        // this.numVisibleProducts = Math.min(5, this.productos.length);
        this.isLoading = false; // Ocultar el skeleton
      },
      (error) => {
        console.error("❌ Error al cargar los productos:");
        this.isLoading = false; // Ocultar el skeleton en caso de error
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
  
    this.productosFiltrados = this.todosLosProductos.filter(p => {
      return (
        (p.nombre && p.nombre.toLowerCase().includes(texto)) ||
        (p.color && p.color.toLowerCase().includes(texto)) ||
        (p.talla && p.talla.toLowerCase().includes(texto)) ||
        (p.tipoCuello && p.tipoCuello.toLowerCase().includes(texto)) ||
        (p.tipoCola && p.tipoCola.toLowerCase().includes(texto)) ||
        (p.tipoCapas && p.tipoCapas.toLowerCase().includes(texto)) ||
        (p.tipoHombro && p.tipoHombro.toLowerCase().includes(texto)) ||
        (p.precioActual && p.precioActual.toString().includes(texto)) ||
        (p.precioAnterior && p.precioAnterior.toString().includes(texto))
      );
    });
  }
  

  resaltarCoincidencia(texto: string): string {
    const query = this.busquedaProducto.trim();
    if (!query) return texto;

    const regex = new RegExp(`(${query})`, 'gi');
    return texto.replace(regex, '<b>$1</b>');
  }

  seleccionarProducto(producto: any): void {
    console.log('Producto seleccionado:', producto);
    this.busquedaProducto = producto.nombre;
    this.mostrarDropdown = false;
    this.router.navigate(["/Detail/" + producto._id]);

  }

  ocultarDropdownConRetraso(): void {
    setTimeout(() => {
      this.mostrarDropdown = false;
    }, 200); // pequeño delay para permitir clic en sugerencia
  }


  async ngOnInit() {
    this.cargarProductos();
    try {
      this.checkInternetConnection();
      const productos = await this.indexedDbService.obtenerProductosApartados();
      this.dressItems = Array.isArray(productos) ? productos : [productos];
      const items = Array.isArray(productos) ? productos : [productos];

      // Inicializar el carrito con los productos obtenidos
      this.cartService.initializeCart(items);
      // Suscribirse a cambios en el carrito
      this.cartSubscription = this.cartService.cartUpdated$.subscribe((message: any) => {
        if (message) {
          this.showAlert(message);
        }
      });
      // console.log(this.dressItems);
    } catch (error) {
      console.error("Error al obtener productos apartados");
    }

  }



  @HostListener("window:online")
  @HostListener("window:offline")
  checkInternetConnection() {
    const connectionStatus = document.getElementById("connection-status");
    const connectioneExit = document.getElementById("connection-exit");
    if (navigator.onLine) {
      connectionStatus!.style.display = 'none'; // Ocultar si hay conexión
      connectioneExit!.style.display = 'block'; // Mostrar si no hay conexión
    } else {
      connectionStatus!.style.display = 'block'; // Mostrar si no hay conexión
      connectioneExit!.style.display = 'none'; // Ocultar si hay conexión
    }
  }
  onMobileChange(isMobile: boolean) {
    // Aquí puedes poner la lógica que quieres ejecutar cuando cambia isMobile
    console.log("isMobile changed:", isMobile);
    // Por ejemplo, podrías llamar a updateMenuItems() aquí si es necesario
    this.updateMenuItems();
  }


  // ngAfterViewInit() {
  //   if (isPlatformBrowser(this.platformId)) {
  //     const nativeElement = this.elementRef.nativeElement;

  //     // Inicializar Semantic UI Dropdown
  //     $(nativeElement).find(".ui.dropdown").dropdown();

  //     // Inicializar búsqueda con contenido
  //     $(nativeElement)
  //       .find(".ui.search")
  //       .search({

  //         onSelect: (result: any) => {
  //           console.log("Seleccionado:", result.title);
  //         },
  //       });

  //     // Mostrar resultados al hacer focus en el input
  //     $(nativeElement)
  //       .find("input")
  //       .on("focus", (event: FocusEvent) => {
  //         const target = event.target as HTMLInputElement;
  //         $(target).parent().find(".ui.search").search("showResults");
  //       });
  //   }
  // }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    this.isSticky = scrollTop > 10;
    this.isScrolled = scrollTop > 10;
  }


filtrarPorCategoria(categoria: string) {
    // this.isLoading = true; // Mostrar el skeleton al cargar
    // this.ngxService.start(); // Inicia el loader
    // this.PRODUCTOSERVICE_.filtrarPorCategoria(categoria).subscribe(
    //   (response) => {
    //     this.ngxService.stop(); // Detiene el loader
    //     this.isLoading = false; // Ocultar el skeleton
    //     this.router.navigate(["/search", categoria]);
    //   },
    //   (error) => {
    //     console.error("❌ Error al cargar los productos por categoría:", error);
    //     this.isLoading = false; // Ocultar el skeleton en caso de error
    //   }
    // );
  }


  // onSearch() {
  //   this.isLoading = true;
  //   this.ngxService.start(); // Inicia el loader
  //   // Reemplaza con la llamada real a la API de búsqueda
  //   setTimeout(() => {
  //     this.isLoading = false;
  //     this.router.navigate(["/search", this.searchQuery]);
  //     this.ngxService.stop(); // Detiene el loader
  //     // Implementa tu lógica de búsqueda aquí
  //     console.log("Buscando:", this.searchQuery);
  //   }, 2000);
  // }

  showDialog() {
    this.sidebarVisible = true;
  }
  popupVisible: boolean = false;

  // Alterna la visibilidad del popup
  togglePopup() {
    this.popupVisible = !this.popupVisible;
  }

  // @HostListener("document:click", ["$event"])
  // onClickOutside(event: Event) {
  //   const clickedInside = this.elementRef.nativeElement.contains(event.target);
  //   if (!clickedInside) {
  //     this.popupVisible = false;
  //   }
  // }

  updateMenuItems() {
    this.isLoggedIn = this.isUserLoggedIn();

    // Asigna items de menú con el tipo correcto
    this.items = this.isLoggedIn
      ? [
        {
          label: "Mi perfil",
          icon: "pi pi-user",
          command: (event: MenuItemCommandEvent) =>
            this.redirectTo("Mi-perfil"),
        },
        {
          label: "Compras",
          icon: "pi pi-cog",
          command: (event: MenuItemCommandEvent) =>
            this.redirectTo("Compras"),
        },
        {
          label: "Cerrar sesión",
          icon: "pi pi-sign-out",
          command: (event: MenuItemCommandEvent) => this.logout(),
        },
      ]
      : [
        {
          label: "Iniciar sesión",
          icon: "pi pi-sign-in",
          command: (event: MenuItemCommandEvent) =>
            this.redirectTo("Sign-in"),
        },
        {
          label: "Registrarme",
          icon: "pi pi-user-plus",
          command: (event: MenuItemCommandEvent) =>
            this.redirectTo("Sign-up"),
        },
        {
          label: "Activar cuenta",
          icon: "pi pi-check-circle",
          command: (event: MenuItemCommandEvent) =>
            this.redirectTo("Activar-cuenta"),
        },
      ];
  }

  logout() {
    localStorage.removeItem("token");
    this.isLoggedIn = false;
    this.updateMenuItems();
    this.router.navigate(["/inicio"]);
  }

  isUserLoggedIn(): boolean {
    // const userData = this.sessionService.();
    const userData = this.sessionService.getUserData();
    if (userData) {
      // alert(userData._id);
      this.userROL = userData.rol;
      return this.userROL === ERol.CLIENTE;
    }
    return false;
  }

  redirectTo(route: string): void {
    this.sidebarVisible = false;
    this.isModalVisible = false;
    this.router.navigate(
      route.includes("Sign-in") ||
        route.includes("Sign-up") ||
        route.includes("forgot-password") ||
        route.includes("Activar-cuenta")
        ? ["/auth", route]
        : ["/", route]
    );
  }
  redirectToCliente(route: string): void {
    this.sidebarVisible = false;
    this.isModalVisible = false;
    this.router.navigate(["/cuenta/", route]
    );
  }




  // Filtra las sugerencias al escribir en el input
  filterSuggestions(): void {
    if (this.searchQuery.length === 0) {
      this.filteredSuggestions = [];
      return;
    }
    const query = this.searchQuery.toLowerCase();
    this.filteredSuggestions = this.suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(query)
    );
  }

  // Resalta coincidencias en negrita
  // highlightMatch(suggestion: string): string {
  //   const query = this.searchQuery;
  //   if (!query) return suggestion;
  //   const regex = new RegExp(`(${query})`, 'gi');
  //   return suggestion.replace(regex, `<b>$1</b>`);
  // }

  // Selecciona una sugerencia y ejecuta la búsqueda
  // selectSuggestion(suggestion: string): void {
  //   this.searchQuery = suggestion;
  //   this.onSearch();
  // }
  // Oculta las sugerencias al perder el foco (con retraso para permitir selección)
  // hideSuggestions(): void {
  //   setTimeout(() => {
  //     this.showSuggestions = false;
  //   }, 200);
  // }


  userMenuOpen: boolean = false;

}
