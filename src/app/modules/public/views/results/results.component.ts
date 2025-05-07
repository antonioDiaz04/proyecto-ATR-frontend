import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ProductoService } from "../../../../shared/services/producto.service";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from "rxjs";
import { CartService } from "../../../../shared/services/cart.service";
import AOS from 'aos';
@Component({
  selector: "app-results",
  templateUrl: "./results.component.html",
  // styleUrls: ["./results.component.scss"],
})
export class ResultsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  searchQuery: string = '';
  hasResults: boolean = true;
  isLoading: boolean = true;
  showAllFallback: boolean = false;
  public currentQueryParams: any = {}; // Nueva propiedad pública para los queryParams

  // Añade esta propiedad para exponer Object al template
  public Object = Object;
  constructor(
    private cartService:CartService,
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductoService,
    private ngxService: NgxUiLoaderService
  ) { }

  ngOnInit(): void {
    this.scrollToTop();
    this.ngxService.start();
    this.initializeData();
    AOS.init({
      duration: 650, // Duración de la animación en milisegundos
      once: true, // Si `true`, la animación solo se ejecuta una vez
    });
  }
  // Método para verificar filtros activos
  public hasActiveFilters(): boolean {
    return (
      this.currentQueryParams && 
      (this.currentQueryParams['color'] || 
       this.currentQueryParams['talla'] || 
       this.currentQueryParams['tipoCuello'])
    );
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeData(): void {
    this.loadAllProducts();
    this.setupRouteListeners();
  }

  private loadAllProducts(): void {
    this.productService.obtenerProductos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.allProducts = products;
          this.filteredProducts = [...products];
          this.hasResults = products.length > 0;
          this.isLoading = false;
          this.ngxService.stop();
        },
        error: (error) => {
          console.error("Error loading products:", error);
          this.handleLoadError();
        }
      });
  }

  private setupRouteListeners(): void {
    // Escuchar cambios en los parámetros de ruta
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.searchQuery = params['query'] || '';
        this.applyFilters();
      });

    // Escuchar cambios en los queryParams con debounce
    this.route.queryParams
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(queryParams => {
        this.applyFilters();
      });
  }

  
  private filterProducts(): any[] {
    let results = [...this.allProducts];
    const { categoria, color, tallaDisponible } = this.route.snapshot.queryParams;

    // Filtro por texto de búsqueda
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      results = results.filter(product => 
        product.nombre.toLowerCase().includes(query) ||
        (product.descripcion?.toLowerCase().includes(query))
      );
    }

    // Filtros adicionales
    if (categoria) {
      results = results.filter(p => p.categoria === categoria);
    }
    if (color) {
      results = results.filter(p => p.colores?.includes(color));
    }
    if (tallaDisponible) {
      results = results.filter(p => p.tallasDisponibles?.includes(tallaDisponible));
    }

    return results;
  }


  private hasActiveSearch(): boolean {
    return this.searchQuery.trim() !== '' || this.hasQueryParams();
  }

  private hasQueryParams(): boolean {
    const { categoria, color, tallaDisponible } = this.route.snapshot.queryParams;
    return !!categoria || !!color || !!tallaDisponible;
  }

  private handleLoadError(): void {
    this.hasResults = false;
    this.isLoading = false;
    this.ngxService.stop();
  }

  scrollToTop(): void {
    window.scrollTo(0, 0);
  }

  viewProductDetails(productId: string): void {
    this.ngxService.start();
    this.router.navigateByUrl(`/Detail/${productId}`);
  }



  apartarRentar(producto: any) {
    const body2 = {
      id: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagenes: producto.imagenes[0],
      opcionesTipoTransaccion: producto.opcionesTipoTransaccion,
    };

    try {
      // Guardar el producto en IndexedDB
      // this.indexedDbService.guardarProducto(body2);

      // Agregar el producto al carrito usando el servicio
      this.cartService.addToCart(body2);
      console.error(body2);

      // // Mostrar diálogo de confirmación
      // this.confirmationService.confirm({
      //   message: `
      //     <div class="product-notification">
      //       <img src="${producto.imagenPrincipal}" alt="${producto.nombre}" class="product-image" />
      //       <div class="product-details">
      //         <h4>${producto.nombre}</h4> 
      //         <p>${producto.precio}</p>
      //       </div>
      //       <p>¿Deseas ir al carrito o iniciar sesión?</p>
      //     </div>
      //   `,
      //   header: 'Producto agregado',
      //   acceptLabel: 'Ir al carrito',
      //   rejectLabel: 'Iniciar sesión',
      //   accept: () => {
      //     // Lógica para ir al carrito
      //     this.goToCart();
      //   },
      //   reject: () => {
      //     // Lógica para iniciar sesión
      //     this.login();
      //   },
      // });
    } catch (error) {
      console.error('Error al guardar el producto:', error);
    }
  }
  // 


   
  
    // Método público para el template
    public applyFilters(): void {
      if (!this.allProducts.length) return;
  
      this.ngxService.start();
      this.isLoading = true;
      this.showAllFallback = false;
  
      const normalizedQuery = this.searchQuery.trim().toLowerCase();
      const queryParams = this.route.snapshot.queryParams as {
        color?: string;
        talla?: string;
        tipoCuello?: string;
        [key: string]: any;
      };
  
      let results = [...this.allProducts];
  
      if (normalizedQuery) {
        results = results.filter(product => 
          this.productMatchesQuery(product, normalizedQuery)
        );
      }
  
      if (queryParams.color) {
        const normalizedColor = queryParams.color.toLowerCase();
        results = results.filter(p => 
          p.color?.toLowerCase() === normalizedColor
        );
      }
  
      if (queryParams.talla) {
        const normalizedTalla = queryParams.talla.toUpperCase();
        results = results.filter(p => 
          p.talla?.toUpperCase() === normalizedTalla
        );
      }
  
      if (queryParams.tipoCuello) {
        const normalizedCuello = queryParams.tipoCuello.toLowerCase();
        results = results.filter(p => 
          p.tipoCuello?.toLowerCase() === normalizedCuello
        );
      }
  
      this.handleFilterResults(results);
    }
  
    // Método público para limpiar filtros
    public clearFilter(filterName: string): void {
      const queryParams = {...this.route.snapshot.queryParams};
      delete queryParams[filterName];
      
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge'
      });
    }
  
    // Resto de métodos permanecen igual...
    private productMatchesQuery(product: any, query: string): boolean {
      const priorityFields = [
        product.nombre,
        product.color,
        product.tipoCuello,
        product.talla,
        product.descripcion,
        product.tipoCola,
        product.tipoHombro
      ];
  
      return priorityFields.some(field => 
        field?.toString().toLowerCase().includes(query)
      );
    }
  
    private handleFilterResults(results: any[]): void {
      this.filteredProducts = results;
      this.hasResults = results.length > 0;
  
      if (!this.hasResults && this.hasActiveSearch()) {
        this.filteredProducts = [...this.allProducts];
        this.showAllFallback = true;
        this.hasResults = true;
      }
  
      this.isLoading = false;
      this.ngxService.stop();
    }
  
    public getSearchSuggestions(): string[] {
      if (!this.searchQuery.trim()) return [];
  
      const query = this.searchQuery.toLowerCase();
      const suggestions = new Set<string>();
  
      this.allProducts.forEach(product => {
        if (product.color.toLowerCase().includes(query)) {
          suggestions.add(`Color: ${product.color}`);
        }
        if (product.tipoCuello.toLowerCase().includes(query)) {
          suggestions.add(`Cuello: ${product.tipoCuello}`);
        }
        if (product.talla.toUpperCase().includes(query.toUpperCase())) {
          suggestions.add(`Talla: ${product.talla}`);
        }
      });
  
      return Array.from(suggestions).slice(0, 5);
    }
  
}