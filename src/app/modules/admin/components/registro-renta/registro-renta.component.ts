import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ProductoService } from '../../../../shared/services/producto.service';
import { VentayrentaService } from '../../../../shared/services/ventayrenta.service';

@Component({
  selector: 'app-registro-renta',
  templateUrl: './registro-renta.component.html',
  styleUrl: './registro-renta.component.scss'
})
export class RegistroRentaComponent implements OnInit {
  rentaId: string | null = null; // Almacena el ID de la renta que se está editando
  vistaActual: string = 'agregar'; // Controla la vista actual ('agregar', 'eliminar', 'listar')
  productos: any[] = []; // Almacena los productos obtenidos del backend
  rentaForm!: FormGroup;

  productoSeleccionado: any | null = null;
  pagos: any[] = [];
  nuevoPago = { monto: 0, metodo: 'Efectivo' };

  constructor(   private confirmationService: ConfirmationService,private productoS:ProductoService,private fb: FormBuilder, private ventaYrentaS_: VentayrentaService) {
    this.rentaForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      direccion: [''],
      productoId: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      metodoPago: ['', Validators.required],
      estado: ['Pendiente', Validators.required],
      precioBase: [0],
      precioTotal: [0],
      notas: [''],
      terminos: [false, Validators.requiredTrue]
    });
  }
  ngOnInit(): void {
    this.getProductos(); // Obtener los productos al iniciar el componente
  }
  getProductos() {
    this.productoS.obtenerProductos().subscribe(
      (response) => {
        this.productos = response;
      },
      (err) => {
        /* The line `productoSeleccionado: any | null = null;` in the TypeScript code is declaring a property
        `productoSeleccionado` in the `RegistroRentaComponent` class. */
        console.log(err);
      }
    );
  }
  cancelar(): void {
    this.rentaForm.reset(); // Limpiar el formulario
    this.vistaActual = 'listar'; // Volver a la vista de listado
  }
  calcularDias(): number {
    const fechaInicio = new Date(this.rentaForm.value.fechaInicio);
    const fechaFin = new Date(this.rentaForm.value.fechaFin);
    const diffTime = fechaFin.getTime() - fechaInicio.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convertir a días
  }
  calcularDiasAdicionales(renta: any): number {
    if (renta.estado === 'Completado') return 0;
    
    const fechaFin = new Date(renta.detallesRenta.fechaFin);
    const hoy = new Date();
    const diffTime = hoy.getTime() - fechaFin.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }



  editarRenta(renta: any): void {
    this.vistaActual = 'editar'; // Cambiar a la vista de edición
    this.rentaId = renta._id; // Guardar el ID de la renta seleccionada
    this.rentaForm.patchValue({
      usuarioId: renta.usuario,
      productoId: renta.producto?._id || '',
      fechaInicio: renta.detallesRenta.fechaInicio.split('T')[0], // Formatear la fecha
      fechaFin: renta.detallesRenta.fechaFin.split('T')[0], // Formatear la fecha
      metodoPago: renta.detallesPago.metodoPago,
      precioRenta: renta.detallesPago.precioRenta,
      estado: renta.estado,
    });
  }
  guardarRenta(): void {
    if (this.rentaForm.valid) {
      const rentaData = this.rentaForm.value;
  
      if (this.rentaId) {
        // Editar renta existente
        this.ventaYrentaS_.editarRenta(this.rentaId, rentaData).subscribe(
          (res) => {
            console.log('Renta actualizada:', res);
            alert('Renta actualizada exitosamente');
            this.rentaForm.reset();
            this.rentaId = null; // Limpiar el ID después de editar
            this.vistaActual = 'listar'; // Volver a la vista de listado
            // this.obtenerRentas(); // Actualizar la lista de rentas
          },
          (error) => {
            console.error('Error al actualizar renta:', error);
          }
        );
      } else {
        // Crear nueva renta
        this.ventaYrentaS_.crearRenta(rentaData).subscribe(
          (res) => {
            console.log('Renta creada:', res);
            alert('Renta creada exitosamente');
            this.rentaForm.reset();
            this.vistaActual = 'listar'; // Volver a la vista de listado
            // this.obtenerRentas(); // Actualizar la lista de rentas
          },
          (error) => {
            console.error('Error al crear renta:', error);
          }
        );
      }
    }
  }



  crearRenta(): void {
    if (this.rentaForm.valid) {
      const rentaData = this.rentaForm.value;
  
      if (this.rentaId) {
        // Editar renta existente
        this.ventaYrentaS_.editarRenta(this.rentaId, rentaData).subscribe(
          (res) => {
            console.log('Renta actualizada:', res);
            alert('Renta actualizada exitosamente');
            this.rentaForm.reset();
            this.rentaId = ''; // Limpiar el ID después de editar
            // this.obtenerRentas(); // Actualizar la lista de rentas
          },
          (error) => {
            console.error('Error al actualizar renta:', error);
          }
        );
      } else {
        // Crear nueva renta
        this.ventaYrentaS_.crearRenta(rentaData).subscribe(
          (res) => {
            console.log('Renta creada:', res);
            alert('Renta creada exitosamente');
            this.rentaForm.reset();
            // this.obtenerRentas(); // Actualizar la lista de rentas
          },
          (error) => {
            console.error('Error al crear renta:', error);
          }
        );
      }
    }
  }
  
  get saldoPendiente(): number {
    const total = this.rentaForm.get('precioTotal')?.value || 0;
    const pagado = this.pagos.reduce((sum, pago) => sum + pago.monto, 0);
    return total - pagado;
  }
  agregarPago(): void {
    if (this.nuevoPago.monto <= 0) return;

    const pago: any = {
      fecha: new Date().toISOString(),
      metodo: this.nuevoPago.metodo,
      monto: this.nuevoPago.monto,
      saldo: this.saldoPendiente - this.nuevoPago.monto,
      estado: 'Aplicado'
    };

    this.pagos.push(pago);
    this.nuevoPago = { monto: 0, metodo: 'Efectivo' };
  }

  calcularSaldos(): void {
    let saldoAcumulado = this.rentaForm.get('precioTotal')?.value || 0;
    
    this.pagos.forEach(pago => {
      saldoAcumulado -= pago.monto;
      pago.saldo = saldoAcumulado;
      pago.estado = saldoAcumulado <= 0 ? 'Completado' : 'Aplicado';
    });
  }
}
