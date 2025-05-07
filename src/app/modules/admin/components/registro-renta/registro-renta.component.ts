import { Component, Input, input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ProductoService } from '../../../../shared/services/producto.service';
import { VentayrentaService } from '../../../../shared/services/ventayrenta.service';
import { UsuarioService } from '../../../../shared/services/usuario.service';

@Component({
  selector: 'app-registro-renta',
  templateUrl: './registro-renta.component.html',
  styleUrl: './registro-renta.component.scss'
})
export class RegistroRentaComponent implements OnInit, OnChanges {
  @Input() rentaId: string | null = null;
  // rentaId: string | null = null; // Almacena el ID de la renta que se está editando
  vistaActual: string = 'agregar'; // Controla la vista actual ('agregar', 'eliminar', 'listar')
  productos: any[] = []; // Almacena los productos obtenidos del backend
  rentaForm!: FormGroup;
  // isNuevo :boolean=false; // Tipo de cliente (Cliente o Empresa)
  productoSeleccionado: any | null = null;
  pagos: any[] = [];
  nuevoPago = { monto: 0, metodo: 'Efectivo' };

  constructor(private us: UsuarioService,
    private confirmationService: ConfirmationService, private productoS: ProductoService, private fb: FormBuilder, private ventaYrentaS_: VentayrentaService) {
    this.rentaForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      direccion: [''],
      productoId: ['', Validators.required],
      fechaOcupacion: ['', Validators.required],
      fechaRecoge: ['', Validators.required],
      fechaRegreso: ['', Validators.required],
      metodoPago: ['', Validators.required],
      estado: ['Pendiente', Validators.required],
      precioBase: [0],
      precioTotal: [0],
      notas: [''],
      terminos: [false, Validators.requiredTrue],
      dias: ['', [Validators.required, Validators.min(1)]],
      subtotal: ['', Validators.required],
      precioRenta: ['', Validators.required],
      liquido: ['', Validators.required],
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rentaId'] && this.rentaId !== undefined && this.rentaId !== null) {
      console.log('rentaId recibido:', this.rentaId); // ✅ Imprime el ID recibido
  
      this.vistaActual = 'editar'; // Cambiar a la vista de edición si se proporciona un ID de renta
      this.ventaYrentaS_.detalleRentaById(this.rentaId).subscribe(
        (res) => {
          if (!res || res.length === 0) return;
  
          this.rentaForm.patchValue({
            nombre: res[0].usuario.nombre,
            email: res[0].usuario.email,
            telefono: res[0].usuario.telefono,
            direccion: res[0].usuario.direccion,
            productoId: res[0].producto._id,
            fechaOcupacion: res[0].detallesRenta.fechaOcupacion?.split('T')[0],
            fechaRecoge: res[0].detallesRenta.fechaRecoge?.split('T')[0],
            fechaRegreso: res[0].detallesRenta.fechaRegreso?.split('T')[0],
            dias: res[0].detallesRenta.duracionDias,
            metodoPago: res[0].detallesPago.metodoPago,
            precioRenta: res[0].detallesPago.precioRenta,
            estado: res[0].estado,
            notas: res[0].notas,
            subtotal: res[0].detallesPago.subtotal || null,
            precioBase: res[0].detallesPago.precioBase || null,
            precioTotal: res[0].detallesPago.precioTotal || null,
            liquido: res[0].detallesPago.liquido || null,
          });
        },
        (error) => {
          console.error('Error al obtener los detalles de la renta:', error);
        }
      );
    } else {
      this.vistaActual = 'agregar';
    }
  }
  
  

  ngOnInit(): void {
    if (this.rentaId !== undefined && this.rentaId !== null) {
      this.vistaActual = 'editar';
    } else {
      this.vistaActual = 'agregar';
    }
  
    this.cargarTodosUsuarios();
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
    const fechaRecoge = new Date(this.rentaForm.value.fechaRecoge);
    const fechaRegreso = new Date(this.rentaForm.value.fechaRegreso);
    const diffTime = fechaRegreso.getTime() - fechaRecoge.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convertir a días
  }
  calcularDiasAdicionales(renta: any): number {
    if (renta.estado === 'Completado') return 0;

    const fechaRegreso = new Date(renta.detallesRenta.fechaRegreso);
    const hoy = new Date();
    const diffTime = hoy.getTime() - fechaRegreso.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }


  guardarRenta(): void {
    console.log("pasando");
    
    if (this.rentaForm.valid) {
      console.log("paso");
      const rentaData = this.rentaForm.value;
  
      // Construir el objeto de usuario dependiendo del tipo
      let usuarioData: any;
      if (this.usuarioSeleccionado) {
        // Cliente frecuente
        usuarioData = {
          _id: this.usuarioSeleccionado._id,
          isNuevo: false,
        };
      } else {
        // Cliente nuevo
        usuarioData = {
          nombre: rentaData.nombre,
          email: rentaData.email,
          telefono: rentaData.telefono,
          isNuevo: true
        };
      }
  
      // Armar el objeto final de renta
      const nuevaRenta = {
        ...rentaData,
        usuario: usuarioData
      };
  
      console.log('Renta a guardar:', nuevaRenta);
  
      if (this.rentaId !== undefined && this.rentaId !== null && this.rentaId !== '') {
        // Editar renta existente
        this.ventaYrentaS_.editarRenta(this.rentaId, nuevaRenta).subscribe({
          next: (res) => {
            console.log('Renta actualizada:', res);
            alert('Renta actualizada exitosamente');
            this.rentaForm.reset();
            this.usuarioSeleccionado = null;
            this.vistaActual = 'listar';
          },
          error: (error) => {
            console.error('Error al actualizar renta:', error);
          }
        });
      } else {
        // Crear nueva renta
        this.ventaYrentaS_.crearRenta(nuevaRenta).subscribe({
          next: (res) => {
            console.log('Renta creada:', res);
            alert('Renta creada exitosamente');
            this.rentaForm.reset();
            this.rentaId = '';
            this.usuarioSeleccionado = null;
            this.vistaActual = 'listar';
          },
          error: (error) => {
            console.error('Error al crear renta:', error);
          }
        });
      }
    } else {
      console.log("Formulario inválido. Controles con errores:");
      Object.keys(this.rentaForm.controls).forEach(key => {
        const controlErrors = this.rentaForm.get(key)?.errors;
        if (controlErrors) {
          console.log(`- ${key}:`, controlErrors);
        }
      });
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
  // 
  usuarioBusqueda: string = '';
  todosUsuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  usuarioSeleccionado: any = null;
  mostrarSugerencias: boolean = false;
  cargarTodosUsuarios() {
    this.us.getUsuarios().subscribe(
      (usuarios) => {
        this.todosUsuarios = usuarios;
        // alert(" cargar usuarios")
      },
      (error) => {
        // alert("Error al cargar usuarios")
        console.error('Error al cargar usuarios:', error);
      }
    );
  }

  filtrarUsuarios() {
    if (this.usuarioBusqueda.length >= 2) {
      const termino = this.usuarioBusqueda.toLowerCase();
      this.usuariosFiltrados = this.todosUsuarios.filter(usuario =>
        usuario.nombre.toLowerCase().includes(termino) ||
        usuario.email.toLowerCase().includes(termino) ||
        usuario.telefono.toLowerCase().includes(termino)
      );
      this.mostrarSugerencias = true;
    } else {
      this.usuariosFiltrados = [];
      this.mostrarSugerencias = false;
    }
  }

  seleccionarUsuario(usuario: any) {
    this.usuarioSeleccionado = usuario;
    // this.isNuevo = usuario.isNuevo || false; // Asignar el tipo de cliente
    this.rentaForm.patchValue({
      usuarioId: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono,
      direccion: usuario.direccion
    });
    this.mostrarSugerencias = false;
    this.usuarioBusqueda = '';
  }


  deseleccionarUsuario() {
    this.usuarioSeleccionado = null;
    // this.isNuevo =true; // Asignar el tipo de cliente
    this.rentaForm.patchValue({
      usuarioId: '',
      nombre: '',
      email: '',
      telefono: '',
      direccion: ''
    });
  }


  registrarNuevoUsuario() {
    // this.isNuevo =true;
    this.usuarioSeleccionado = null;
    this.rentaForm.patchValue({
      nombre: this.usuarioBusqueda,
      email: '',
      telefono: '',
      direccion: '',
      usuarioId: '' // asegurarse de que no quede un ID previo
    });
    this.mostrarSugerencias = false;
  }


  onFocus() {
    if (this.usuarioBusqueda.length >= 2) {
      this.mostrarSugerencias = true;
    }
  }

  onBlur() {
    setTimeout(() => {
      this.mostrarSugerencias = false;
    }, 200);
  }
}
