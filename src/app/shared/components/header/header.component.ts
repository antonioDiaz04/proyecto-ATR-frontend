import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  AfterViewInit,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal,
  Input,
  SimpleChanges,
  OnChanges,
  computed,
  effect,
  OnDestroy,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { ConfirmationService, MenuItem, MenuItemCommandEvent, MessageService } from "primeng/api";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { SessionService } from "../../services/session.service";
import { ERol } from "../../constants/rol.enum";
import { DatosEmpresaService } from "../../services/datos-empresa.service";
import { ThemeServiceService } from "../../services/theme-service.service";
import { CartService } from "../../services/cart.service";
import { IndexedDbService } from "../../../modules/public/commons/services/indexed-db.service";
import { Subscription } from 'rxjs';
import { LoginModalComponent } from "../login-modal/login-modal.component";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { InputNumberModule } from "primeng/inputnumber";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MessageModule } from "primeng/message";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withFetch } from "@angular/common/http";
import { SidebarModule } from "primeng/sidebar";
import { Toast, ToastrService } from 'ngx-toastr';
import { CsrfInterceptor } from "../../services/csrf.interceptor";
import { UsuarioService } from "../../services/usuario.service";
import { SignInService } from "../../../modules/auth/commons/services/sign-in.service";
import { ProductoService } from "../../services/producto.service";
import { SignUpService } from "../../../modules/auth/commons/services/sign-up.service";
import { provideClientHydration } from "@angular/platform-browser";
import { ToastModule } from "primeng/toast";

declare const $: any;

export interface DressItem {
  id: string;
  nombre: string;
  precio: number;
  imagenPrincipal: string;
}

@Component({
  selector: "app-header",
  standalone: true,
  imports: [/* The `SidebarModule` in the Angular code you provided is being imported in the `HeaderComponent` class. This module is likely a custom Angular module or a module provided by a third-party library (such as PrimeNG) that provides functionality related to displaying a sidebar component. */
    FormsModule,ToastModule,SidebarModule,RouterModule,LoginModalComponent,InputTextModule,FloatLabelModule,
      InputNumberModule,ConfirmDialogModule,MessageModule,
      CommonModule,ReactiveFormsModule,
      HttpClientModule],
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: CsrfInterceptor,
    multi: true, // Permite múltiples interceptores
  },Toast,MessageService,
  SessionService,
  UsuarioService,
  ToastrService,CartService,
  MessageService,IndexedDbService,
  ConfirmationService,SignInService,
  SignUpService,ProductoService,UsuarioService,DatosEmpresaService,ThemeServiceService],
})
export class HeaderComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  isScrolled = false;
  sidebarVisible = false;
  @Input() isMobile = false;
  items: MenuItem[] = [];
  isLoggedIn = false;
  // Señal para manejar el contador
  dressItemCount!:any;
  userROL!: string;
  isSticky = false;
  searchQuery = ""; // Bind search input
  datosEmpresa: any = {};
  nombreDeLaPagina: string = "";
  dressItems: any[] = [];
  // Señal para manejar reactividad
  private dressItemsSignal = signal<any[]>([]);
  private cartSubscription!: Subscription;
  empresaData: any;
  // private cartSubscription!: Subscription;
  imageUrl!: string;
  defaultImageUrl: string =
    "https://res.cloudinary.com/dvvhnrvav/image/upload/v1730395938/images-AR/wyicw2mh3xxocscx0diz.png";
  isDarkThemeOn = signal(false);

  darkMode = false;
  constructor(
    private indexedDbService: IndexedDbService,

    private sessionService: SessionService,
    private datosEmpresaService: DatosEmpresaService,
    private elementRef: ElementRef,
    public themeService: ThemeServiceService,
    private cartService: CartService,
    private router: Router,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    // dressItemCount = this.cartService.dressItemCount; // Usar la señal del servicio
 // Usar la señal computada del servicio para el contador
    this.dressItemCount = this.cartService.dressItemCount;
   
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
    this.updateMenuItems(); // Actualiza los elementos del menú
    try {  
      // Inicializar el carrito (si es necesario)
      this.cartService.initializeCart([]); // Puedes pasar los ítems iniciales aquí
      // Inicializar el carrito con los productos de IndexedDB
      const productos = await this.indexedDbService.obtenerProductosApartados();
      this.cartService.initializeCart(productos);

      // Suscribirse a cambios en el carrito
      this.cartSubscription = this.cartService.cartUpdated$.subscribe(() => {
        console.log("El carrito ha cambiado");
        // Aquí puedes realizar acciones adicionales, como mostrar una notificación
      });
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

  isLoading = false;

  onSearch() {
    this.isLoading = true;
    // Reemplaza con la llamada real a la API de búsqueda
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(["/public/search", this.searchQuery]);

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
}
