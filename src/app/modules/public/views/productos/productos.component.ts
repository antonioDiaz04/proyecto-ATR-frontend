import {
  Component,
  HostListener,
  Inject,
  OnInit, ViewChild,
  PLATFORM_ID, ElementRef
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Router } from "@angular/router";
import { SessionService } from "../../../../shared/services/session.service";
import { ERol } from "../../../../shared/constants/rol.enum";
import { DatosEmpresaService } from "../../../../shared/services/datos-empresa.service";
import { ProductoService } from "../../../../shared/services/producto.service";
import { IndexedDbService } from "../../commons/services/indexed-db.service";
import { NgxUiLoaderService } from "ngx-ui-loader";

@Component({
  selector: "app-productos",
  templateUrl: "./productos.component.html",
  // styleUrls: ["./productos.component.scss"],
})
export class ProductosComponent implements OnInit {
  isMobile: boolean = false;
  visible: boolean = false;
  userROL!: string;
  position: any = "bottom-left";
  productosPaginados: any = [];
  numVisibleProducts: number = 5; // Valor por defecto
  rows = 7; // Número de elementos por página
  skeletonItems: any[] = Array(5).fill({}); // Array de 6 elementos para el skeleton
  productos: any = []; // Inicializamos como array vacío
  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 4,
      numScroll: 1
    },
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  autoplay = 2000; // Intervalo en milisegundos
  defaultAutoplay = 2000; // Guarda el valor original

  pauseCarousel() {
    this.autoplay = 0; // Detener autoplay
  }

  resumeCarousel() {
    this.autoplay = this.defaultAutoplay; // Restaurar autoplay
  }

  // Inicializamos isLoading en true para mostrar el skeleton
  isLoading: boolean = true;

  constructor(
    private indexedDbService: IndexedDbService,
    private router: Router,
    private ngxService: NgxUiLoaderService,
    private sessionService: SessionService,
    private datosEmpresaService: DatosEmpresaService,
    private PRODUCTOSERVICE_: ProductoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  private detectDevice() {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      console.log(ua);
      this.isMobile = window.innerWidth <= 600;
    }
  }
  calcularDescuento(precioAnterior: number, precioActual: number): number {
    return Math.round(((precioAnterior - precioActual) / precioAnterior) * 100);
  }




  @HostListener("window:resize", ["$event"])
  onResize() {
    this.detectDevice();
  }

  // Antes de recargar o cerrar la página, vaciamos productos y mostramos el skeleton
  @HostListener("window:beforeunload", ["$event"])
  onBeforeUnload(event: Event) {
    this.ngxService.start(); // Inicia el loader
    console.log("⏳ La página se está recargando...");
    this.isLoading = true;
    this.productos = []; // Vaciar los productos en la carga
  }

  // HostListener para window:load (se dispara al cargar la página)
  @HostListener("window:load", ["$event"])
  onWindowLoad(event: Event) {
    this.ngxService.stop(); // Detiene el loader
    console.log("✅ La página se ha cargado completamente.");
    // Cargar los productos después de que la página se haya cargado
    this.cargarProductos();
  }

  ngOnInit() {
    // Al iniciar la carga, vaciamos el array de productos
    this.productos = [];
    this.isLoading = true;

    this.detectDevice();

    // Cargar los productos solo si la página no se está recargando
    if (!this.isPageReloading()) {
      this.cargarProductos();
    } else {
      // console.log("⏳ La página se está recargando, no se cargarán los productos.");
      this.isLoading = false;
      this.cargarProductos();
      this.ngxService.start(); // Inicia el loader

    }

    this.detectDevice();
  }

  cargarProductos() {
    this.isLoading = true; // Mostrar el skeleton al cargar
    this.PRODUCTOSERVICE_.obtenerProductos().subscribe(
      (response) => {
        this.ngxService.stop(); // Inicia el loader

        // console.log("📦 Productos recibidos:");
        this.productos = response;
        this.numVisibleProducts = Math.min(5, this.productos.length);
        this.isLoading = false; // Ocultar el skeleton
      },
      (error) => {
        console.error("❌ Error al cargar los productos:");
        this.isLoading = false; // Ocultar el skeleton en caso de error
      }
    );
  }

  isPageReloading(): boolean {

    return performance.navigation.type === performance.navigation.TYPE_RELOAD;
  }

  // isPageReloading(): boolean {
  //   if (typeof window === "undefined" || typeof performance === "undefined") {
  //     console.warn("No se está ejecutando en un navegador");
  //     return false;
  //   }

  //   if (typeof performance.getEntriesByType === "function") {
  //     const navigationEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  //     if (navigationEntries.length > 0 && "type" in navigationEntries[0]) {
  //       return navigationEntries[0].type === "reload";
  //     }
  //   }

  //   return (window.performance as any)?.navigation?.type === 1;
  // }

  // isPageReloading(): boolean {
  //   const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  //   return navEntries.length > 0 && navEntries[0].type === "reload";
  // }

  verDetalles(id: number) {
    this.ngxService.start(); // Inicia el loader
    this.router.navigate(["/Detail/" + id]);
  }

  redirectTo(route: string): void {
    console.log(route);
    if (route === "Sign-in") {
      this.router.navigate(["/auth/Sign-in"]);
    } else {
      console.log("click", route);
      this.router.navigate(["/", route]);
    }
  }

  cambiarPagina(event: any) {
    const start = event.first;
    const end = start + event.rows;
    this.productosPaginados = this.productos.slice(start, end);
  }

  apartarRentar(producto: any) {
    console.log("Producto seleccionado:", producto);
    const body2 = {
      id: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagenPrincipal: producto.imagenPrincipal,
    };

    try {
      this.indexedDbService.guardarProducto(body2);
    } catch (error) {
      console.error("Error al guardar el producto:", error);
    }
  }

  @ViewChild('carousel', { static: false }) carousel!: ElementRef;

  scrollLeft() {
    this.carousel.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
  }

  scrollRight() {
    this.carousel.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
  }




  // Función para cambiar la imagen al hacer hover
   cambiarImagen(producto: any, event: MouseEvent) {
    const imgElement = event.target as HTMLImageElement;
    if (!producto._hoverIndex) {
      producto._hoverIndex = 0;
    }
    if (producto.imagenes && producto.imagenes.length > 1) {
      producto._hoverIndex = (producto._hoverIndex + 1) % producto.imagenes.length;
      imgElement.src = producto.imagenes[producto._hoverIndex];
    }
  }

  // Función para restaurar la imagen al salir del hover
  restaurarImagen(producto: any, event: MouseEvent) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = producto.imagenPrincipal || producto.imagenes[0]; // Restaurar la primera imagen
  }

}
