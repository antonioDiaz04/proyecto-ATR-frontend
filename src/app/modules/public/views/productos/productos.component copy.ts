import {
    Component,
    HostListener,
    Inject,
    OnInit,
    ViewChild,
    PLATFORM_ID,
    ElementRef
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Router } from "@angular/router";
// Importaciones de servicios existentes
import { SessionService } from "../../../../shared/services/session.service";
import { ERol } from "../../../../shared/constants/rol.enum";
import { DatosEmpresaService } from "../../../../shared/services/datos-empresa.service";
import { ProductoService } from "../../../../shared/services/producto.service";
import { IndexedDbService } from "../../commons/services/indexed-db.service";
import { NgxUiLoaderService } from "ngx-ui-loader";

// Importaciones de NgRx
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

// Asumimos que tienes una interfaz para el estado global y los productos
interface AppState {
    productos: any; // Ajusta esto a tu interfaz de estado real
}

// Asumimos que tienes definido un selector y una acción
// **DEBES DEFINIR ESTOS EN TUS ARCHIVOS NGRX**
// import * as ProductosActions from './store/productos.actions';
// import { selectAllProductos } from './store/productos.selectors';
const selectAllProductos: any = (state: AppState) => state.productos.data; // Selector simulado
const loadProductos: any = () => ({ type: '[Productos] Load Productos' }); // Acción simulada


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
    
    // Ahora 'productos' será un Observable (NgRx Store Pattern)
    productos$: Observable<any[]> | undefined;
    productos: any[] = []; // Mantenemos el array para la paginación y la plantilla

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
        @Inject(PLATFORM_ID) private platformId: Object,
        // 🚨 INYECTAMOS EL STORE DE NGRX 🚨
        private store: Store<AppState>
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

    @HostListener("window:beforeunload", ["$event"])
    onBeforeUnload(event: Event) {
        this.ngxService.start();
        console.log("⏳ La página se está recargando...");
        this.isLoading = true;
        this.productos = [];
    }

    @HostListener("window:load", ["$event"])
    onWindowLoad(event: Event) {
        this.ngxService.stop();
        console.log("✅ La página se ha cargado completamente.");
        // La carga se inicia en ngOnInit, no es necesario aquí
    }

    ngOnInit() {
        this.productos = [];
        this.isLoading = true;
        this.detectDevice();
        
        this.cargarProductos(); // Lógica de NgRx
    }

    /**
     * 🚀 Nueva lógica de carga usando NgRx Store.
     * 1. Se suscribe al selector de productos para recibir actualizaciones.
     * 2. Despacha la acción de carga, delegando la lógica de cache/API al Effect.
     */
    cargarProductos() {
        this.isLoading = true;
        this.ngxService.start();

        // 1. Suscribirse a los productos del Store
        // Usamos .pipe(filter) para ignorar el estado inicial vacío y solo reaccionar a datos.
        this.productos$ = this.store.select(selectAllProductos).pipe(
            filter(productos => productos && productos.length > 0), // Solo deja pasar si hay productos
            tap(productos => {
                // 2. Actualizar las propiedades del componente
                this.productos = productos;
                this.numVisibleProducts = Math.min(5, this.productos.length);
                this.isLoading = false;
                this.ngxService.stop();
                console.log("📦 Productos actualizados desde NgRx Store.");
            })
        );
        
        // 3. Despachar la acción para que el NgRx Effect inicie el proceso.
        // El Effect debe contener la lógica de:
        //    a) Buscar en IndexedDB
        //    b) Si no está o es obsoleto, llamar a ProductoService
        //    c) Si la llamada a ProductoService es exitosa, guardar en IndexedDB y actualizar el Store.
        this.store.dispatch(loadProductos());

        // Si el estado inicial del Store es vacío, el skeleton se mostrará hasta que el Effect
        // cargue los datos (desde IndexedDB o API) y los ponga en el Store.
    }

    isPageReloading(): boolean {
        return performance.navigation.type === performance.navigation.TYPE_RELOAD;
    }

    // El resto del código permanece igual o con ajustes menores
    // ...
    
    verDetalles(id: number) {
        this.ngxService.start();
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
            // Esto sigue usando IndexedDB, pero para el carrito/apartado, no para el caché de la lista.
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

    restaurarImagen(producto: any, event: MouseEvent) {
        const imgElement = event.target as HTMLImageElement;
        imgElement.src = producto.imagenPrincipal || producto.imagenes[0];
    }
}