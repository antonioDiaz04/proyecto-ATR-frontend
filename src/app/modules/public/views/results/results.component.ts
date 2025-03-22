import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductoService } from '../../../../shared/services/producto.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
})
export class ResultsComponent implements OnInit {
  results: any[] = [];
  query: string = '';
  resultadosEncontrados: boolean = true;
  todosProductos: any[] = []; // Variable que almacenará todos los productos

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private productS_: ProductoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.scrollToTop(); // Solo ejecuta en el navegador
    }

    // Cargar todos los productos al inicio
    this.cargarTodosLosProductos();

    this.route.params.subscribe((params) => {
      this.query = params['query'] || '';

      // Si el query es "vestidos", cargar todos los productos
      if (this.query.toLowerCase() === 'vestidos') {
        this.resultadosEncontrados = true; // Se consideran resultados
        this.results = this.todosProductos; // Mostrar todos los productos
        return;
      }

      // Si el query está vacío
      if (!this.query || this.query.trim() === '') {
        this.resultadosEncontrados = true; // Hay todos los productos
        this.results = this.todosProductos; // Mostrar todos los productos
        return;
      }

      // Si el query tiene valor, buscar productos
      this.buscarProductos();
    });

    // Escuchar cambios en los parámetros de consulta para filtros avanzados
    this.route.queryParams.subscribe((queryParams) => {
      const { categoria, color, tallas } = queryParams;

      // Si hay filtros en los parámetros de consulta
      if (categoria || color || tallas) {
        this.buscarProductosAvanzados(categoria, color, tallas); // Pasar tallas directamente
      } else {
        // Si no hay parámetros, cargar todos los productos
        this.cargarTodosLosProductos();
      }
    });
  }
  private scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0); // Asegura que solo se ejecuta en el navegador
    }
  }
  private buscarProductosAvanzados(
    categoria: any,
    color: any,
    tallaDisponible: any // Recibe tallas directamente
  ): void {
    this.http
      .post(`${environment.api}/producto/buscarAvanzados`, {
        categoria,
        color,
        tallaDisponible,
      })
      .subscribe({
        next: (data: any) => {
          console.error(
            'búsqueda avanzada:',
            categoria,
            color,
            tallaDisponible
          );
          if (data && data.resultados && data.resultados.length > 0) {
            this.results = data.resultados;
            console.error('resultados de búsqueda avanzada:', data.resultados);
            this.resultadosEncontrados = true;
          } else {
            this.resultadosEncontrados = false;
            this.results = []; // No se encontraron resultados
          }
        },
        error: (error) => {
          console.error('Error en búsqueda avanzada:', error);
          this.resultadosEncontrados = false;
          this.results = []; // No se encontraron resultados
        },
      });
  }

  private buscarProductos(): void {
    this.http
      .get(`${environment.api}/producto/buscar/${this.query}`)
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.results = data.resultados;
            this.resultadosEncontrados = true; // Se encontraron resultados
            this.cargarTodosLosProductos();
          } else {
            this.resultadosEncontrados = false; // No se encontraron resultados
            this.results = this.todosProductos; // Mostrar todos los productos
          }
        },
        error: (error) => {
          console.error('Error en la búsqueda:', error);
          this.resultadosEncontrados = false; // No se encontraron resultados
          this.results = this.todosProductos; // Mostrar todos los productos
        },
      });
  }

  private cargarTodosLosProductos(): void {
    this.productS_.obtenerProductos().subscribe({
      next: (data) => {
        this.todosProductos = data; // Asignar la respuesta a todosProductos
        this.results = data; // Asigna todos los productos a results para mostrar
        this.resultadosEncontrados = true; // Inicialmente hay productos
      },
      error: (error) => {
        console.error('Error al cargar todos los productos:', error);
        this.resultadosEncontrados = false; // No se encontraron productos
      },
    });
  }

  // Navegar a detalles de producto
  verDetalles(product: any): void {
    this.router.navigateByUrl(`public/Detail/${product}`);
  }
}
