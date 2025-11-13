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
  
  // ✅ ESTADOS UI
  isMobile: boolean = false;
  visible: boolean = false;
  userROL!: string;
  position: any = "bottom-left";
  isLoading: boolean = true;
  isOnline: boolean = false;
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

  ngOnInit() {
    this.detectDevice();
    this.checkOnlineStatus();
    this.setupOnlineOfflineListeners();
    this.loadProducts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ LÓGICA OFFLINE-FIRST: NO llamar API si estás offline
  private async loadProducts() {
    this.isLoading = true;
    this.ngxService.start();
    this.error = null;

    // ✅ DECISIÓN INMEDIATA: Online u Offline
    if (this.isOnline) {
      // 1️⃣ ONLINE: Intentar API
      try {
        const productos = await this.productoService.obtenerProductos().pipe(
          takeUntil(this.destroy$)
        ).toPromise();
        
        const productosValidos = productos || [];
        
        if (productosValidos.length > 0) {
          // ✅ Guardar en cache para próxima vez
          await this.indexedDbService.guardarProductosOffline(productosValidos);
          console.log('✅ ONLINE: Productos de API y cacheados');
        }
        
        this.productos = productosValidos;
      } catch (error) {
        console.error('❌ Error en API, usando cache:', error);
        await this.loadFromIndexedDB();
      }
    } else {
      // 2️⃣ OFFLINE: NO llamar API, leer directamente de cache
      console.log('❌ OFFLINE: Leyendo directamente de IndexedDB');
      await this.loadFromIndexedDB();
    }

    // ✅ Actualizar UI
    this.numVisibleProducts = Math.min(5, this.productos.length);
    this.cambiarPagina({ first: 0, rows: this.rows });
    this.isLoading = false;
    this.ngxService.stop();
  }

  // ✅ CARGA DESDE INDEXEDDB
  private async loadFromIndexedDB() {
    try {
      const productosOffline = await this.indexedDbService.obtenerProductosOffline();
      
      if (productosOffline.length > 0) {
        this.productos = productosOffline;
        console.log('✅ CACHE: Productos obtenidos de IndexedDB');
      } else {
        this.error = 'No hay conexión y no hay datos guardados offline';
        this.productos = [];
      }
    } catch (error) {
      console.error('❌ ERROR CACHE:', error);
      this.error = 'Error al cargar datos offline';
      this.productos = [];
    }
  }

  // ✅ DETECTAR CONEXIÓN
  private checkOnlineStatus() {
    if (isPlatformBrowser(this.platformId)) {
      this.isOnline = navigator.onLine;
    }
  }

  private setupOnlineOfflineListeners() {
    if (!isPlatformBrowser(this.platformId)) return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Conexión restaurada - Recargando desde API');
      this.loadProducts(); // Recargar todo
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('❌ Conexión perdida - Modo offline activado');
    });
  }

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
    this.productos = [];
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
}