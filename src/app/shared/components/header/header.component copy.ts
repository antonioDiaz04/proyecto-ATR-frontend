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

  private cartSubscription!: Subscription;

  constructor(
    private PRODUCTOSERVICE_: ProductoService,
    private router: Router,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {}

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

  resaltarCoincidencia(texto: string): SafeHtml {
    const query = this.busquedaProducto.trim();
    if (!query) return texto;

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
}
