import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VentayrentaService } from '../../../../shared/services/ventayrenta.service';
import { ProductoService } from '../../../../shared/services/producto.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-listado-renta',
  templateUrl: './listado-renta.component.html',
  // styleUrls: ['./listado-renta.component.scss']
})
export class ListadoRentaComponent implements OnInit {
  // vistaActual: string = 'agregar'; // Controla la vista actual ('agregar', 'eliminar', 'listar')
  // rentaForm!: FormGroup;
  rentas: any[] = []; // Almacena las rentas obtenidas del backend
  rentaId!: string; // Almacena el ID de la renta que se está editando
  constructor(private confirmationService: ConfirmationService, private productoS: ProductoService, private fb: FormBuilder, private ventaYrentaS_: VentayrentaService) { }

  ngOnInit(): void {
    this.obtenerRentas();
  }

  sidebarVisible = false;

  abrirFormulario() {
    // this.vistaActual == vistaActual;
    // this.rentaId = id;
    this.sidebarVisible = true;

  }

  editarRenta(id: string) {
    // this.vistaActual == vistaActual;
    this.rentaId = id;
    this.sidebarVisible = true;

  }

  cerrarSidebar() {
    this.sidebarVisible = false;
  }
  obtenerRentas(): void {
    this.ventaYrentaS_.obtenerRentas().subscribe(
      (res) => {
        this.rentas = res.rentas.map((renta: any) => {
          const fechaRecoge = new Date(renta.detallesRenta.fechaRecoge);
          const fechaRegreso = new Date(renta.detallesRenta.fechaRegreso);

          return {
            ...renta,
            usuarioNombre: renta.usuario?.nombre || 'Usuario no disponible',
            usuarioE: renta.usuario?.email || 'Usuario no disponible',
            usuarioT: renta.usuario?.telefono || 'Usuario no disponible',
            productoNombre: renta.producto?.nombre || 'Producto no disponible',
            precioActual: renta.producto?.precioActual, // Nueva propiedad
            precioAnterior: renta.producto?.precio, // Nueva propiedad
            isOferta: renta.producto?.isOferta || "si", // Nueva propiedad
            estado: renta.estado, // Nueva propiedad
            detallesRenta: {
              ...renta.detanllesRenta,
              fechaRecoge: fechaRecoge.toISOString().split('T')[0],
              fechaRegreso: fechaRegreso.toISOString().split('T')[0]
            },
            precioFormateado: this.formatearPrecio(renta.detallesPago.precioRenta)
          };
        });
      },
      (error) => {
        console.error('Error al obtener rentas:', error);
      }
    );
  }
  // Métodos para calcular días adicionales, multas y totales
  calcularDuracion(renta: any): number {
    const inicio = new Date(renta.detallesRenta.fechaRecoge);
    const fin = new Date(renta.detallesRenta.fechaRegreso);
    return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  }

  calcularDiasAdicionales(renta: any): number {
    if (renta.estado === 'Completado') return 0;
    const fechaRegreso = new Date(renta.detallesRenta.fechaRegreso);
    const hoy = new Date();
    const diffTime = hoy.getTime() - fechaRegreso.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  calcularMulta(renta: any): number {
    const diasAdicionales = this.calcularDiasAdicionales(renta);
    if (diasAdicionales <= 0) return 0;

    const valorDiario = renta.detallesPago.precioRenta / this.calcularDuracion(renta);
    return diasAdicionales * (valorDiario * 0.2); // 20% del valor diario por día
  }
 
  esRentaVencida(renta: any): boolean {
    return this.calcularDiasAdicionales(renta) > 0 && renta.estado;
  }
  calcularTotal(renta: any): number {
    return renta.detallesPago.precioRenta + this.calcularMulta(renta);
  }

  // formatearPrecio(precio: number): string {
  //   return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(precio);
  // }
  // Función auxiliar para formatear precio
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(precio);
  }
  eliminarRentaPorId(rentaId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta renta?')) {
      this.ventaYrentaS_.cancelarRenta({ rentaId }).subscribe(
        (res) => {
          console.log('Renta eliminada:', res);
          alert('Renta eliminada exitosamente');
          this.obtenerRentas(); // Actualizar la lista de rentas
        },
        (error) => {
          console.error('Error al eliminar renta:', error);
        }
      );
    }
  }
  // Add these properties to your component
  selectedRentas: string[] = []; // Array to store selected rental IDs
  allRentasSelected = false;

  // Method to toggle selection of a single rental
  toggleRentaSelection(rentaId: string): void {
    const index = this.selectedRentas.indexOf(rentaId);
    if (index === -1) {
      this.selectedRentas.push(rentaId);
    } else {
      this.selectedRentas.splice(index, 1);
    }
    this.allRentasSelected = this.selectedRentas.length === this.rentas.length;
  }

  // Method to check if a rental is selected
  isRentaSelected(rentaId: string): boolean {
    return this.selectedRentas.includes(rentaId);
  }

  // Method to toggle all rentals selection
  toggleAllRentas(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.allRentasSelected = isChecked;

    if (isChecked) {
      this.selectedRentas = this.rentas.map(renta => renta._id);
    } else {
      this.selectedRentas = [];
    }
  }
  cancelar() {
    this.selectedRentas = []; // Clear selected rentals
    this.allRentasSelected = false; // Reset the select all checkbox
    this.obtenerRentas(); // Refresh the list of rentals
  }
  // Updated method to delete multiple rentals
  eliminarRentasSeleccionadas(): void {
    if (this.selectedRentas.length === 0) return;

    if (confirm(`¿Estás seguro de que deseas eliminar las ${this.selectedRentas.length} rentas seleccionadas?`)) {
      this.ventaYrentaS_.eliminarRentasSeleccionadas(this.selectedRentas).subscribe(
        (res) => {
          console.log('Rentas eliminadas:', res);
          alert(`${this.selectedRentas.length} rentas eliminadas exitosamente`);
          this.selectedRentas = [];
          this.allRentasSelected = false;
          this.obtenerRentas(); // Refresh the list
        },
        (error) => {
          console.error('Error al eliminar rentas:', error);
        }
      );
    }
  }


  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0'); // Los meses comienzan desde 0
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }
  cancelarEdicion() {

  }
  openUserSearch() {

  }
  // filtrarRentas(event: any) { }
  getStatusClass(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'bg-warning text-white';
      case 'Aprobada':
        return 'bg-success text-white';
      case 'Cancelada':
        return 'bg-danger text-white';
      default:
        return '';
    }
  }

  // En tu componente (ej: gestion-rentas.component.ts)

  // Variables para las estadísticas (debes calcularlas según tus datos)
  rentasActivas: number = 0;  // Rentas con estado 'Activo'
  nuevasRentas: number = 0;    // Rentas creadas en los últimos 7 días
  variacionNuevas: number = 0; // % de cambio vs semana anterior
  multasPendientes: number = 0;// Multas no pagadas
  multasPagadas: number = 0;   // Multas pagadas
  maxRentas: number = 100;     // Máximo esperado para la barra de progreso (ajusta según necesidad)

  // Datos para el mini gráfico histórico (ejemplo)
  historialRentas: any[] = [
    { day: 'L', value: 5 },
    { day: 'M', value: 7 },
    { day: 'M', value: 6 },
    { day: 'J', value: 8 },
    { day: 'V', value: 10 },
    { day: 'S', value: 12 },
    { day: 'D', value: 8 },
    // ... repetir para 30 días o como necesites
  ];

  // Método para calcular las estadísticas (llamarlo al cargar/actualizar datos)
  calcularEstadisticas(): void {
    const ahora = new Date();
    const hace7dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const hace14dias = new Date(ahora.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Calcular valores
    this.rentasActivas = this.rentas.filter(r => r.estado === 'Activo').length;

    this.nuevasRentas = this.rentas.filter(r => {
      const fechaRenta = new Date(r.fechaCreacion);
      return fechaRenta >= hace7dias;
    }).length;

    const nuevasSemanaAnterior = this.rentas.filter(r => {
      const fechaRenta = new Date(r.fechaCreacion);
      return fechaRenta >= hace14dias && fechaRenta < hace7dias;
    }).length;

    this.variacionNuevas = nuevasSemanaAnterior > 0 ?
      Math.round(((this.nuevasRentas - nuevasSemanaAnterior) / nuevasSemanaAnterior) * 100) : 100;

    // Asumiendo que tus rentas tienen una propiedad 'multas'
    this.multasPendientes = this.rentas.reduce((total, renta) =>
      total + (renta.multas?.filter((m: any) => !m.pagada).length || 0), 0);

    this.multasPagadas = this.rentas.reduce((total, renta) =>
      total + (renta.multas?.filter((m: any) => m.pagada).length || 0), 0);

    // Máximo para la barra de progreso (puedes ajustar esto)
    this.maxRentas = Math.max(this.rentas.length * 1.3, 50); // 30% más que el actual o mínimo 50
  }
  // ççççççççterminar


  // 
  rentasFiltradas: any[] = [];
  filtroTexto: string = '';
  filtroEstado: string = '';
  campoOrden: string = 'detallesRenta.fechaRecoge';
  ordenAscendente: boolean = false;
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  mostrarModalImagenes: boolean = false;
  imagenesProducto: string[] = [];
  filtrarRentas(): void {
    this.rentasFiltradas = this.rentas.filter(renta => {
      const coincideTexto =
        renta.productoNombre.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        renta.usuarioNombre.toLowerCase().includes(this.filtroTexto.toLowerCase());

      const coincideEstado = this.filtroEstado ? renta.estado === this.filtroEstado : true;

      return coincideTexto && coincideEstado;
    });

    this.ordenarRentas();
    this.paginaActual = 1;
  }

  ordenarPor(campo: string): void {
    if (this.campoOrden === campo) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.campoOrden = campo;
      this.ordenAscendente = true;
    }
    this.ordenarRentas();
  }

  ordenarRentas(): void {
    this.rentasFiltradas.sort((a, b) => {
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

  eliminarRenta(id: any): void {
    this.ventaYrentaS_.eliminarRenta(id).subscribe(
      (res) => {
        console.log('Renta eliminada:', res);
        alert('Renta eliminada exitosamente');
        this.obtenerRentas(); // Actualizar la lista de rentas
      },
      (error) => {
        console.error('Error al eliminar renta:', error);
      }
    );
  }


  // Funcionalidades adicionales
  verImagenGrande(imagenes: string[]): void {
    this.imagenesProducto = imagenes || [];
    this.mostrarModalImagenes = true;
  }

  verDetallesRenta(renta: any): void {
    // this.dialogService.open(DetalleRentaComponent, {
    //   header: `Detalles de renta`,
    //   width: '70%',
    //   data: { renta: renta }
    // });
  }

  confirmarEliminacion(renta: any): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar la renta de "${renta.productoNombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.eliminarRentaPorId(renta._id);
      }
    });
  }

  generarContrato(renta: any): void {
    // Lógica para generar contrato PDF
    console.log('Generando contrato para:', renta);
  }

  get totalPaginas(): number {
    return Math.ceil(this.rentasFiltradas.length / this.itemsPorPagina);
  }

  get rentasPaginadas(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.rentasFiltradas.slice(inicio, inicio + this.itemsPorPagina);
  }

}