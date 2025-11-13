import { Component, HostListener, Inject, OnInit, OnDestroy, ViewChild, ElementRef, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Router } from "@angular/router";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SessionService } from "../../../../shared/services/session.service";
import { ProductoService } from "../../../../shared/services/producto.service";
import { IndexedDbService } from "../../commons/services/indexed-db.service";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { Producto } from '../../../../shared/models/Producto.model';
import Swal from 'sweetalert2';

@Component({
  selector: "app-productos",
  templateUrl: "./productos.component.html",
})
export class ProductosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // ✅ ESTADOS
  isMobile: boolean = false;
  visible: boolean = false;
  userROL!: string;
  position: any = "bottom-left";
  isLoading: boolean = true;
  isOnline: boolean = true;
  error: string | null = null;

  // ✅ DATOS
  productos: Producto[] = [];
  productosPaginados: Producto[] = [];
  numVisibleProducts: number = 5;
  rows = 7;
  skeletonItems: any[] = Array(5).fill({});

  // Carousel
  autoplay = 2000;
  defaultAutoplay = 2000;
  responsiveOptions = [
    { breakpoint: '1400px', numVisible: 4, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 3, numScroll: 1 },
    { breakpoint: '768px', numVisible: 2, numScroll: 1 },
    { breakpoint: '560px', numVisible: 1, numScroll: 1 }
  ];

  @ViewChild('carousel', { static: false }) carousel!: ElementRef;

  constructor(
    private indexedDbService: IndexedDbService,
    private router: Router,
    private ngxService: NgxUiLoaderService,
    private sessionService: SessionService,
    private productoService: ProductoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  async ngOnInit() {
    this.detectDevice();
    this.checkOnlineStatus();
    this.setupOnlineOfflineListeners();
    await this.loadProducts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ LÓGICA PRINCIPAL MEJORADA
  private async loadProducts() {
    this.isLoading = true;
    this.ngxService.start();
    this.error = null;

    try {
      if (this.isOnline) {
        await this.loadFromAPI();
      } else {
        await this.loadFromCache();
      }
    } catch (error) {
      console.error('❌ Error crítico cargando productos:', error);
      this.error = 'Error al cargar los productos';
      this.productos = [];
    } finally {
      this.updateUI();
      this.isLoading = false;
      this.ngxService.stop();
    }
  }

  // ✅ CARGA DESDE API (Online)
  private async loadFromAPI() {
    console.log('🌐 ONLINE: Intentando cargar desde API...');
    
    try {
      const productos = await this.productoService.obtenerProductos()
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      const productosValidos = productos || [];
      
      if (productosValidos.length > 0) {
        // Guardar en cache para próxima vez (pero no esperar)
        this.indexedDbService.guardarProductosOffline(productosValidos)
          .then(() => console.log('✅ Productos guardados en cache'))
          .catch(err => console.error('❌ Error guardando en cache:', err));
        
        this.productos = productosValidos;
        console.log(`✅ API: ${productosValidos.length} productos cargados`);
      } else {
        throw new Error('API devolvió array vacío');
      }
      
    } catch (error) {
      console.warn('❌ Error en API, intentando cache...', error);
      await this.loadFromCache();
    }
  }

  // ✅ CARGA DESDE CACHE (Offline/Fallback)
  private async loadFromCache() {
    console.log('📂 OFFLINE: Cargando desde cache...');
    
    try {
      const productosOffline = await this.indexedDbService.obtenerProductosOffline();
      
      if (productosOffline.length > 0) {
        this.productos = productosOffline;
        console.log(`✅ CACHE: ${productosOffline.length} productos recuperados`);
        
        // Mostrar advertencia de modo offline
        if (!this.isOnline) {
          Swal.fire({
            icon: 'info',
            title: 'Modo Offline',
            text: 'Mostrando datos guardados. Algunas funciones pueden estar limitadas.',
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
          });
        }
      } else {
        this.error = this.isOnline 
          ? 'No se pudieron cargar los productos' 
          : 'No hay conexión y no hay datos guardados';
        this.productos = [];
      }
    } catch (cacheError) {
      console.error('❌ Error cargando desde cache:', cacheError);
      this.error = 'Error al cargar los datos locales';
      this.productos = [];
    }
  }

  // ✅ ACTUALIZAR UI
  private updateUI() {
    this.numVisibleProducts = Math.min(5, this.productos.length);
    this.cambiarPagina({ first: 0, rows: this.rows });
  }

  // ✅ DETECCIÓN DE CONEXIÓN MEJORADA
  private checkOnlineStatus() {
    if (isPlatformBrowser(this.platformId)) {
      this.isOnline = navigator.onLine;
      console.log(`🔌 Estado conexión: ${this.isOnline ? 'ONLINE' : 'OFFLINE'}`);
    }
  }

  private setupOnlineOfflineListeners() {
    if (!isPlatformBrowser(this.platformId)) return;

    window.addEventListener('online', async () => {
      console.log('🌐 Conexión restaurada - Sincronizando...');
      this.isOnline = true;
      
      // Recargar datos frescos
      await this.loadProducts();
      
      Swal.fire({
        icon: 'success',
        title: 'Conexión restaurada',
        text: 'Datos actualizados',
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false
      });
    });

    window.addEventListener('offline', () => {
      console.log('❌ Conexión perdida - Modo offline');
      this.isOnline = false;
      
      Swal.fire({
        icon: 'warning',
        title: 'Sin conexión',
        text: 'Modo offline activado',
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false
      });
    });
  }

  // ✅ MÉTODOS EXISTENTES (sin cambios)
  detectDevice() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;
    }
  }

  @HostListener("window:resize", ["$event"])
  onResize() {
    this.detectDevice();
  }

  @HostListener("window:beforeunload", ["$event"])
  onBeforeUnload(event: Event) {
    this.ngxService.start();
    this.isLoading = true;
  }

  calcularDescuento(precioAnterior: number, precioActual: number): number {
    if (!precioAnterior || precioAnterior <= 0) return 0;
    return Math.round(((precioAnterior - precioActual) / precioAnterior) * 100);
  }

  verDetalles(id: any) {
    this.ngxService.start();
    this.router.navigate(["/Detail/" + id]);
  }

  redirectTo(route: string): void {
    if (route === "Sign-in") {
      this.router.navigate(["/auth/Sign-in"]);
    } else {
      this.router.navigate(["/", route]);
    }
  }

  cambiarPagina(event: any) {
    const start = event.first;
    const end = start + event.rows;
    this.productosPaginados = this.productos.slice(start, end);
  }

  apartarRentar(producto: Producto) {
    const productoParaGuardar = {
      id: producto._id,
      nombre: producto.nombre,
      precio: producto.precioActual,
      imagenPrincipal: producto.imagenes[0],
      fechaGuardado: new Date().toISOString()
    };

    this.indexedDbService.guardarProducto(productoParaGuardar).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Producto apartado',
        text: `${producto.nombre} ha sido guardado`,
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false
      });
    }).catch(error => {
      console.error("Error al guardar:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el producto',
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false
      });
    });
  }

  scrollLeft() {
    if (this.carousel?.nativeElement) {
      this.carousel.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }

  scrollRight() {
    if (this.carousel?.nativeElement) {
      this.carousel.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
    }
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

  // ✅ NUEVO: Forzar recarga desde API
  async recargarProductos() {
    this.isOnline = true;
    await this.loadFromAPI();
  }

  // ✅ NUEVO: Limpiar cache
  async limpiarCache() {
    try {
      await this.indexedDbService.limpiarProductosOffline();
      Swal.fire('✅', 'Cache limpiado correctamente', 'success');
    } catch (error) {
      Swal.fire('❌', 'Error limpiando cache', 'error');
    }
  }
}