import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VentayrentaService } from '../../../../shared/services/ventayrenta.service';
import { ProductoService } from '../../../../shared/services/producto.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-listado-venta',
  templateUrl: './listado-venta.component.html',
})
export class ListadoVentaComponent implements OnInit {
  // vistaActual: string = 'agregar'; // Controla la vista actual ('agregar', 'eliminar', 'listar')
  // rentaForm!: FormGroup;
  ventas: any[] = []; // Almacena las ventas obtenidas del backend
  productos: any[] = []; // Almacena los productos obtenidos del backend
  ventaId!: string; // Almacena el ID de la venta que se está editando

  constructor(
    private confirmationService: ConfirmationService,
    private productoS: ProductoService,
    private fb: FormBuilder,
    private ventaService: VentayrentaService
  ) { }

  ngOnInit(): void {
    this.obtenerVentas();
  }

  getProductos() {
    this.productoS.obtenerProductos().subscribe(
      (response) => {
        this.productos = response;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  sidebarVisible = false;

  abrirFormulario() {
    this.sidebarVisible = true;
  }

  editarVenta(id: string) {
    this.ventaId = id;
    this.sidebarVisible = true;
  }

  cerrarSidebar() {
    this.sidebarVisible = false;
  }

  obtenerVentas(): void {
    this.ventaService.obtenerVentas().subscribe(
      (res: any) => {
        this.ventas = res.ventas.map((venta: any) => {
          const fechaVenta = new Date(venta.fechaVenta);
          const fechaEntrega = new Date(venta.fechaEntrega);

          return {
            ...venta,
            clienteNombre: venta.cliente?.nombre || 'Cliente no disponible',
            clienteEmail: venta.cliente?.email || 'Email no disponible',
            clienteTelefono: venta.cliente?.telefono || 'Teléfono no disponible',
            productoNombre: venta.producto?.nombre || 'Producto no disponible',
            precioActual: venta.producto?.precioActual,
            precioAnterior: venta.producto?.precio,
            isOferta: venta.producto?.isOferta || false,
            estado: venta.estado,
            detallesVenta: {
              ...venta.detallesVenta,
              fechaVenta: fechaVenta.toISOString().split('T')[0],
              fechaEntrega: fechaEntrega?.toISOString().split('T')[0] || ''
            },
            precioFormateado: this.formatearPrecio(venta.total)
          };
        });
        this.calcularEstadisticas();
      },
      (error) => {
        console.error('Error al obtener ventas:', error);
      }
    );
  }

  // Métodos auxiliares para ventas
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(precio);
  }

  eliminarVenta(ventaId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
      this.ventaService.cancelarVenta({ ventaId }).subscribe(
        (res) => {
          console.log('Venta eliminada:', res);
          alert('Venta eliminada exitosamente');
          this.obtenerVentas();
        },
        (error) => {
          console.error('Error al eliminar venta:', error);
        }
      );
    }
  }

  // Gestión de selección múltiple
  selectedVentas: string[] = [];
  allVentasSelected = false;

  toggleVentaSelection(ventaId: string): void {
    const index = this.selectedVentas.indexOf(ventaId);
    if (index === -1) {
      this.selectedVentas.push(ventaId);
    } else {
      this.selectedVentas.splice(index, 1);
    }
    this.allVentasSelected = this.selectedVentas.length === this.ventas.length;
  }

  isVentaSelected(ventaId: string): boolean {
    return this.selectedVentas.includes(ventaId);
  }

  toggleAllVentas(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.allVentasSelected = isChecked;

    if (isChecked) {
      this.selectedVentas = this.ventas.map(venta => venta._id);
    } else {
      this.selectedVentas = [];
    }
  }

  cancelar() {
    this.selectedVentas = [];
    this.allVentasSelected = false;
    this.obtenerVentas();
  }

  eliminarVentasSeleccionadas(): void {
    if (this.selectedVentas.length === 0) return;

    if (confirm(`¿Estás seguro de que deseas eliminar las ${this.selectedVentas.length} ventas seleccionadas?`)) {
      this.ventaService.eliminarVentasSeleccionadas(this.selectedVentas).subscribe(
        (res) => {
          console.log('Ventas eliminadas:', res);
          alert(`${this.selectedVentas.length} ventas eliminadas exitosamente`);
          this.selectedVentas = [];
          this.allVentasSelected = false;
          this.obtenerVentas();
        },
        (error) => {
          console.error('Error al eliminar ventas:', error);
        }
      );
    }
  }

  // Filtrado y ordenación
  ventasFiltradas: any[] = [];
  filtroTexto: string = '';
  filtroEstado: string = '';
  campoOrden: string = 'fechaVenta';
  ordenAscendente: boolean = false;
  paginaActual: number = 1;
  itemsPorPagina: number = 10;

  filtrarVentas(): void {
    this.ventasFiltradas = this.ventas.filter(venta => {
      const coincideTexto =
        venta.productoNombre.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        venta.clienteNombre.toLowerCase().includes(this.filtroTexto.toLowerCase());

      const coincideEstado = this.filtroEstado ? venta.estado === this.filtroEstado : true;

      return coincideTexto && coincideEstado;
    });

    this.ordenarVentas();
    this.paginaActual = 1;
  }

  ordenarPor(campo: string): void {
    if (this.campoOrden === campo) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.campoOrden = campo;
      this.ordenAscendente = true;
    }
    this.ordenarVentas();
  }

  ordenarVentas(): void {
    this.ventasFiltradas.sort((a, b) => {
      let valorA = this.obtenerValorPropiedad(a, this.campoOrden);
      let valorB = this.obtenerValorPropiedad(b, this.campoOrden);

      if (typeof valorA === 'string') valorA = valorA.toLowerCase();
      if (typeof valorB === 'string') valorB = valorB.toLowerCase();

      if (valorA < valorB) return this.ordenAscendente ? -1 : 1;
      if (valorA > valorB) return this.ordenAscendente ? 1 : -1;
      return 0;
    });
  }

  obtenerValorPropiedad(objeto: any, ruta: string): any {
    return ruta.split('.').reduce((o, i) => o?.[i], objeto);
  }

  // Estadísticas de ventas
  ventasCompletadas: number = 0;
  nuevasVentas: number = 0;
  variacionNuevas: number = 0;
  devolucionesPendientes: number = 0;
  devolucionesProcesadas: number = 0;
  maxVentas: number = 100;
  historialVentas: any[] = [
    { day: 'L', value: 5 },
    { day: 'M', value: 7 },
    // ... más datos históricos
  ];

  calcularEstadisticas(): void {
    const ahora = new Date();
    const hace7dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const hace14dias = new Date(ahora.getTime() - 14 * 24 * 60 * 60 * 1000);

    this.ventasCompletadas = this.ventas.filter(v => v.estado === 'Completado').length;

    this.nuevasVentas = this.ventas.filter(v => {
      const fechaVenta = new Date(v.fechaVenta);
      return fechaVenta >= hace7dias;
    }).length;

    const nuevasSemanaAnterior = this.ventas.filter(v => {
      const fechaVenta = new Date(v.fechaVenta);
      return fechaVenta >= hace14dias && fechaVenta < hace7dias;
    }).length;

    this.variacionNuevas = nuevasSemanaAnterior > 0 ?
      Math.round(((this.nuevasVentas - nuevasSemanaAnterior) / nuevasSemanaAnterior) * 100) : 100;

    this.devolucionesPendientes = this.ventas.reduce((total, venta) =>
      total + (venta.devoluciones?.filter((d: any) => !d.procesada).length || 0), 0);

    this.devolucionesProcesadas = this.ventas.reduce((total, venta) =>
      total + (venta.devoluciones?.filter((d: any) => d.procesada).length || 0), 0);

    this.maxVentas = Math.max(this.ventas.length * 1.3, 50);
  }

  // Paginación
  get totalPaginas(): number {
    return Math.ceil(this.ventasFiltradas.length / this.itemsPorPagina);
  }

  get ventasPaginadas(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.ventasFiltradas.slice(inicio, inicio + this.itemsPorPagina);
  }

  // Funcionalidades adicionales
  mostrarModalImagenes: boolean = false;
  imagenesProducto: string[] = [];

  verImagenGrande(imagenes: string[]): void {
    this.imagenesProducto = imagenes || [];
    this.mostrarModalImagenes = true;
  }

  confirmarEliminacion(venta: any): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar la venta de "${venta.productoNombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.eliminarVenta(venta._id);
      }
    });
  }

  generarFactura(venta: any): void {
    console.log('Generando factura para:', venta);
  }

}