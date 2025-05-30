import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../../../shared/services/producto.service';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

interface Producto {
  _id: string;
  nombre: string;
  categoria: string;
  color: string;
  opcionesTipoTransaccion: 'renta' | 'Venta';
  precioActual: number;
  precioAnterior?: number;
  disponible: boolean;
  nuevo: boolean;
  imagenes: string[];
  talla?: string;
  altura?: number;
  cintura?: number;
}

@Component({
  selector: 'app-listado-productos',
  templateUrl: './listado-productos.component.html',
  // styleUrls: ['./listado-productos.component.scss']
})
export class ListadoProductosComponent implements OnInit {
  allProducts: Producto[] = [];
  filteredProducts: Producto[] | null = null;
  mostrarModalAddVestido: boolean = false;
  totalRecords: number = 0;
  rows: number = 5;
  first: number = 0;
  filterText: string = '';
  productForm!: FormGroup;
  productoEditar: string | null = null;
  activeFilter: 'all' | 'renta' | 'Venta' | 'nuevo' | 'oferta' = 'all';

  filters = [
    { label: 'Todos', value: 'all' },
    { label: 'Renta', value: 'renta' },
    { label: 'Venta', value: 'Venta' },
    { label: 'Nuevos', value: 'nuevo' },
    { label: 'Ofertas', value: 'oferta' }
  ];

  constructor(private productoS: ProductoService, private router: Router) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productoS.obtenerProductos().subscribe(
      (productos:any) => {
        this.allProducts = productos;
        this.filteredProducts = null; // Reiniciar los productos filtrados
        this.totalRecords = productos.length; // Total de registros
        this.applyFilters(); // Aplicar filtros iniciales
      },
      (error) => {
        console.error('Error al cargar productos:', error);
      }
    );
  }


 
  // Filtros y búsqueda
  filterByType(type: 'all' | 'renta' | 'Venta' | 'nuevo' | 'oferta'| any): void {
    this.activeFilter = type;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allProducts];

    // Aplicar filtro activo
    if (this.activeFilter === 'renta' || this.activeFilter === 'Venta') {
      filtered = filtered.filter(p => p.opcionesTipoTransaccion === this.activeFilter);
    } else if (this.activeFilter === 'nuevo') {
      filtered = filtered.filter(p => p.nuevo);
    } else if (this.activeFilter === 'oferta') {
      filtered = filtered.filter(p => p.precioAnterior && p.precioAnterior > p.precioActual);
    }

    // Aplicar filtro de texto si existe
    if (this.filterText) {
      const searchText = this.filterText.toLowerCase();
      filtered = filtered.filter(p => 
        p.nombre.toLowerCase().includes(searchText) ||
        p.categoria.toLowerCase().includes(searchText) ||
        p.color.toLowerCase().includes(searchText)
      );
    }

    this.filteredProducts = filtered.length === this.allProducts.length ? null : filtered;
    this.totalRecords = filtered.length;
  }

  onGlobalFilter(event: Event): void {
    this.filterText = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters();
  }

  // Gestión de productos
  abrirModal(): void {
    this.mostrarModalAddVestido = true;
    this.productoEditar = null;
  }
  cerrarModal(): void {
    this.mostrarModalAddVestido = false;
    this.productoEditar = null;
  }

  editProduct(id: string): void {
    this.productoEditar = id;
    this.mostrarModalAddVestido = true;
    this.router.navigate([`admin/control-productos/edit-producto/${id}`]);
  }

  cerrarModalHandler(mostrar: boolean): void {
    this.mostrarModalAddVestido = mostrar;
    if (!mostrar) {
      this.productoEditar = null;
      this.loadProducts(); // Recargar productos al cerrar el modal
    }
  }

  deleteProduct(id: string): void {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.confirmarEliminar(id);
      }
    });
  }

  confirmarEliminar(id: string): void {
    this.productoS.eliminarProducto(id).subscribe({
      next: () => {
        this.loadProducts();
        Swal.fire('Eliminado', 'El producto se ha eliminado correctamente.', 'success');
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
      }
    });
  }

  // Paginación
  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
  }

  // Métodos de ayuda
  countByTransactionType(type: 'renta' | 'Venta'): number {
    return this.allProducts.filter(p => p.opcionesTipoTransaccion === type).length;
  }

  countNewProducts(): number {
    return this.allProducts.filter(p => p.nuevo).length;
  }

  countDiscountProducts(): number {
    return this.allProducts.filter(p => p.precioAnterior && p.precioAnterior > p.precioActual).length;
  }

  toggleAvailability(product: Producto): void {
    product.disponible = !product.disponible;
    // Aquí deberías llamar al servicio para actualizar en el backend
  }

  truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  }
}