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
import { HttpClient } from '@angular/common/http';

declare const $: any;

@Component({
  selector: 'app-header',
  standalone: false,

  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService, ConfirmationService],
})
export class HeaderComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
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


  suggestions: string[] = []; // Lista de sugerencias
  // Categorías de búsqueda
  filteredSuggestions: string[] = [];
  categories: { [key: string]: Set<string> } = {}; // Almacenar características únicas

  darkMode = false;
  constructor(
    private http: HttpClient,
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

  async ngOnInit() {
    this.loadProducts()
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

  //
  // loadCompanyData() {
  //   this.datosEmpresaService.traerDatosEmpresa().subscribe(
  //     (data) => {
  //       this.empresaData = data[0]; // Guardar los datos en la variable
  //       this.nombreDeLaPagina = this.empresaData?.tituloPagina;
  //       this.imageUrl = this.empresaData?.logo;
  //     },
  //     (error) => {
  //       console.error("Error al cargar los datos de la empresa:", error);
  //     }
  //   );
  // }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const nativeElement = this.elementRef.nativeElement;

      // Inicializar Semantic UI Dropdown
      $(nativeElement).find(".ui.dropdown").dropdown();

      // Inicializar búsqueda con contenido
      $(nativeElement)
        .find(".ui.search")
        .search({

          onSelect: (result: any) => {
            console.log("Seleccionado:", result.title);
          },
        });

      // Mostrar resultados al hacer focus en el input
      $(nativeElement)
        .find("input")
        .on("focus", (event: FocusEvent) => {
          const target = event.target as HTMLInputElement;
          $(target).parent().find(".ui.search").search("showResults");
        });
    }
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    this.isSticky = scrollTop > 10;
    this.isScrolled = scrollTop > 10;
  }


  onSearch() {
    this.isLoading = true;
    this.ngxService.start(); // Inicia el loader
    // Reemplaza con la llamada real a la API de búsqueda
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(["/public/search", this.searchQuery]);
      this.ngxService.stop(); // Detiene el loader
      // Implementa tu lógica de búsqueda aquí
      console.log("Buscando:", this.searchQuery);
    }, 2000);
  }

  showDialog() {
    this.sidebarVisible = true;
  }
  popupVisible: boolean = false;

  // Alterna la visibilidad del popup
  togglePopup() {
    this.popupVisible = !this.popupVisible;
  }

  @HostListener("document:click", ["$event"])
  onClickOutside(event: Event) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.popupVisible = false;
    }
  }

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
    this.router.navigate(["/public/inicio"]);
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
        : ["/public", route]
    );
  }
  redirectToCliente(route: string): void {
    this.sidebarVisible = false;
    this.isModalVisible = false;
    this.router.navigate(["/cuenta/", route]
    );
  }
  // Cargar todos los productos y organizar características en categorías
  loadProducts(): void {
    this.http.get<any[]>('http://localhost:4000/api/v1/producto/')
      .subscribe(products => {
        this.categories = {
          color: new Set(),
          talla: new Set(),
          tipoCuello: new Set(),
          tipoCola: new Set(),
          tipoCapas: new Set(),
          tipoHombro: new Set()
        };

        products.forEach((product: any) => {
          if (product.color) this.categories['color'].add(product.color);
          if (product.talla) this.categories['talla'].add(product.talla);
          if (product.tipoCuello) this.categories['tipoCuello'].add(product.tipoCuello);
          if (product.tipoCola) this.categories['tipoCola'].add(product.tipoCola);
          if (product.tipoCapas) this.categories['tipoCapas'].add(product.tipoCapas);
          if (product.tipoHombro) this.categories['tipoHombro'].add(product.tipoHombro);
          
        });
      });
  }
  // Propiedad que controla si las sugerencias están visibles
  suggestionsVisible: boolean = false;
  // Función que se llama cuando el input pierde el enfoque
  hideSuggestions() {
    this.suggestionsVisible = false; // Oculta las sugerencias
  }
  // Filtrar sugerencias basadas en el input del usuario
  filterSuggestions(): void {
    if (this.searchQuery.length === 0) {
      this.suggestions = [];
      this.showSuggestions = false;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.suggestions = [];

    // Usamos corchetes para acceder a las claves dinámicas
    Object.entries(this.categories).forEach(([key, values]) => {
      values.forEach(value => {
        if (value.toLowerCase().includes(query)) {
          this.suggestions.push(value);
        }
      });
    });

    this.showSuggestions = this.suggestions.length > 0;
  }


  // Resaltar coincidencias en negrita
  highlightMatch(text: string): string {
    const query = this.searchQuery;
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, `<b>$1</b>`);
  }

  // Seleccionar una sugerencia y realizar búsqueda
  selectSuggestion(suggestion: string): void {
    this.searchQuery = suggestion;
    this.onSearch();
  }

  // // Ejecutar búsqueda con la sugerencia seleccionada
  // onSearch(): void {
  //   console.log('Buscando:', this.searchQuery);
  //   this.showSuggestions = false;
  // }

}