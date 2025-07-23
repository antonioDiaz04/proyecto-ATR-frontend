import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  NgZone,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../../../shared/services/producto.service';
import { SessionService } from '../../../../shared/services/session.service';
import { UsuarioService } from '../../../../shared/services/usuario.service';
import { SwPush } from '@angular/service-worker';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { TransactionService } from './../../../../shared/services/transaction.service';
declare const paypal: any;

@Component({
  selector: 'app-process-renta',
  templateUrl: './process-renta.component.html',
  // styleUrls: ['./process-renta.component.scss'],
})
export class ProcessRentaComponent implements OnInit {
  isLoading: boolean = false;
  productId: string = '';
  Detalles: any;
  rangoFechas: {
    fechaInicio: string;
    fechaFin: string;
    totalRentas: number;
  } | null = null;

  isPayPalEnabled: boolean = false;
  anticipo: number = 0; // Valor del anticipo ingresado por el usuario
  minAnticipo: number = 0; // Este valor será al menos el 50% de la renta
  anticipoError: boolean = false; // Para mostrar el mensaje de er

  minFechaInicio: string = ''; // Fecha mínima de inicio
  maxFechaInicio: string = ''; // Fecha máxima de inicio
  minFechaFin: string = ''; // Fecha mínima de fin (considerando el margen)
  maxFechaFin: string = ''; // Fecha máxima de fin

  // Variables del formulario de renta
  usuarioId: string = '';
  nombreSolicitante: string = '';
  arrendatario: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';
  direccionInmueble: string = '';
  montoRenta: number | null = null;
  contratoGenerado: boolean = false;
  publicKey: string = environment.publicKey;

  @ViewChild('paypal', { static: false })
  paypalElement!: ElementRef;

  private paypalLoaded: boolean = false;

  constructor(
    private location: Location,
    private swPush: SwPush,
    private activatedRoute: ActivatedRoute,
    private productoS_: ProductoService,
    private cdRef: ChangeDetectorRef,
    private http: HttpClient,
    private transactionService: TransactionService,
    private messageService: MessageService,
    private router: Router,
    private sessionService: SessionService,
    private usuarioService: UsuarioService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.scrollToTop();
    this.minAnticipo = this.montoRenta! * 0.5;
    // this.generarToken(); // Generamos el token antes de enviar los datos

    this.productId = this.activatedRoute.snapshot.params['id'];

    // Obtener los datos del usuario
    const idUser = this.sessionService.getId() ?? '';

    this.usuarioService.detalleUsuarioById(idUser).subscribe({
      next: (response) => {
        this.usuarioId = response._id;
        this.arrendatario = `${response.nombre} ${response.apellidos}`;
        this.nombreSolicitante = `${response.nombre} ${response.apellidos}`;
        this.direccionInmueble = response.direccion;
        this.montoRenta = this.Detalles?.precio ?? null;
      },
      error: (err) => {
        console.error('Error al obtener el cliente:', err);
      },
    });

    this.productoS_.obtenerDetalleProductoById(this.productId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.Detalles = response;
        console.log(response);
        this.montoRenta = this.Detalles?.precio;
        console.log('Detalles:', this.Detalles);
        this.cdRef.detectChanges();
        this.checkPayPalLoaded().then(() => {
          this.loadProductDetails();
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al obtener detalles:', err);
      },
    });

    // Obtener el rango de fechas del vestido y configurarlo
    this.productoS_.obtenerRangoFechasVestido(this.productId).subscribe({
      next: (productos) => {
        if (productos && productos.length > 0) {
          const fechas = this.calcularRangoFechas(productos);
          this.rangoFechas = fechas;
          this.configurarFechas(); // Configurar las fechas con el margen de 3-4 días
        }
      },
      error: (err) => {
        console.error('Error al obtener rango de fechas:', err);
      },
    });
    this.setMinMaxFechas();
  }
  validarAnticipo(): void {
    if (this.anticipo < this.minAnticipo) {
      this.anticipoError = true;
    } else {
      this.anticipoError = false;
    }
  }

  // Método para establecer las fechas mínimas y máximas
  setMinMaxFechas() {
    const hoy = new Date();
    this.minFechaInicio = this.formatFecha(hoy); // Fecha mínima de inicio (hoy)
    this.minFechaFin = this.formatFecha(
      new Date(hoy.setDate(hoy.getDate() + 3))
    ); // Fecha mínima de fin (3 días después de hoy)

    this.maxFechaInicio = this.formatFecha(
      new Date(hoy.setFullYear(hoy.getFullYear() + 1))
    ); // Fecha máxima de inicio (1 año desde hoy)
    this.maxFechaFin = this.formatFecha(
      new Date(hoy.setFullYear(hoy.getFullYear() + 1))
    ); // Fecha máxima de fin (1 año desde hoy)
  }

  actualizarFechaFin(): void {
    if (this.fechaInicio) {
      const fechaInicio = new Date(this.fechaInicio);
      fechaInicio.setDate(fechaInicio.getDate() + 3); // 3 días después de la fecha de inicio
      this.fechaFin = this.formatFecha(fechaInicio); // Establecer la fecha de fin
    }
  }
  actualizarFechaInicio(): void {
    if (this.fechaFin) {
      const fechaFin = new Date(this.fechaFin);
      fechaFin.setDate(fechaFin.getDate() - 3); // 3 días antes de la fecha de fin
      this.fechaInicio = this.formatFecha(fechaFin); // Establecer la fecha de inicio
    }
  }

  calcularRangoFechas(productos: any): {
    fechaInicio: string;
    fechaFin: string;
    totalRentas: number;
  } {
    let fechaInicio: Date = new Date();
    let fechaFin: Date = new Date();
    let totalRentas: number = 0;

    // Lógica para calcular el rango de fechas basado en los productos
    interface ProductoRenta {
      fechaInicio: string;
      fechaFin: string;
      // Puedes agregar más propiedades si existen en el objeto producto
    }

    productos.forEach((producto: ProductoRenta) => {
      const fechaInicioProducto: Date = new Date(producto.fechaInicio); // Suponiendo que cada producto tiene fechas
      const fechaFinProducto: Date = new Date(producto.fechaFin);

      if (fechaInicioProducto < fechaInicio) fechaInicio = fechaInicioProducto;
      if (fechaFinProducto > fechaFin) fechaFin = fechaFinProducto;

      totalRentas += 1; // Suponiendo que cada producto cuenta como una renta
    });

    return {
      fechaInicio: this.formatFecha(fechaInicio),
      fechaFin: this.formatFecha(fechaFin),
      totalRentas: totalRentas,
    };
  }

  // Validar fechas de inicio y fin
  validarFechas() {
    if (this.fechaInicio && this.fechaFin) {
      const fechaInicio = new Date(this.fechaInicio);
      const fechaFin = new Date(this.fechaFin);

      // Validar si la fecha de fin es al menos 3 días después de la fecha de inicio
      if (
        fechaFin.getTime() - fechaInicio.getTime() <
        3 * 24 * 60 * 60 * 1000
      ) {
        alert(
          'La fecha de entrega debe ser al menos 3 días después de la fecha de recogida.'
        );
        this.fechaFin = '';
      }
    }
  }

  configurarFechas() {
    if (this.rangoFechas) {
      const fechaInicioOcupada = new Date(this.rangoFechas.fechaFin); // Fecha de fin ocupada
      const fechaFinOcupada = new Date(this.rangoFechas.fechaInicio); // Fecha de inicio ocupada

      // La fecha mínima de inicio será el día siguiente al último día de la renta ocupada
      fechaInicioOcupada.setDate(fechaInicioOcupada.getDate() + 1); // +1 día
      this.minFechaInicio = this.formatFecha(fechaInicioOcupada);

      // La fecha máxima de inicio será el mismo día de la renta ocupada
      this.maxFechaInicio = this.formatFecha(fechaFinOcupada);

      // La fecha mínima de fin será el mismo día de la renta ocupada (pero con margen de días)
      const fechaFinConMargen = new Date(fechaFinOcupada);
      fechaFinConMargen.setDate(fechaFinConMargen.getDate() + 4); // Añadir 4 días como margen
      this.minFechaFin = this.formatFecha(fechaFinOcupada);

      // La fecha máxima de fin es el margen añadido
      this.maxFechaFin = this.formatFecha(fechaFinConMargen);
    }
  }
  formatFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  onFechaInicioChange() {
    this.actualizarFechaFin(); // Actualizar la fecha de fin automáticamente
  }

  // Método de cambio de fecha de fin (cuando se selecciona la fecha de fin)
  onFechaFinChange() {
    this.actualizarFechaInicio(); // Actualizar la fecha de inicio automáticamente
  }

  private checkPayPalLoaded(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (typeof paypal !== 'undefined') {
          this.paypalLoaded = true;
          clearInterval(checkInterval);
          resolve();
        }
      }, 500);
    });
  }

  private loadProductDetails(): void {
    this.productoS_.obtenerDetalleProductoById(this.productId).subscribe({
      next: (response) => {
        this.Detalles = response;
        this.initializePayPal();
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener detalles:', err);
        this.isLoading = false;
      },
    });
  }

  calcularTotalRenta(): number {
    if (!this.fechaInicio || !this.fechaFin) {
      return this.Detalles?.precio || 0;
    }

    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return (this.Detalles?.precio || 0) * diffDays;
  }
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Método de submit del formulario
  onSubmit(): void {
    this.isLoading = true; // Activamos el loader
    // this.generarToken(); // Generamos el token antes de enviar los datos
  }

  initializePayPal() {
    if (!this.paypalLoaded || !this.paypalElement?.nativeElement) {
      console.error('PayPal no está cargado o el elemento no existe');
      return;
    }

    // Verificar si el anticipo es suficiente (debe ser al menos el 50% del valor de la renta)
    if (this.anticipo < this.minAnticipo) {
      this.messageService.add({
        severity: 'warning',
        summary: 'Error',
        detail: 'El anticipo debe ser al menos el 50% del valor de la renta.',
      });

      return; // No continuar con la inicialización de PayPal si el anticipo no es suficiente
    }

    // Si el anticipo es suficiente, continuar con la inicialización de PayPal
    this.ngZone.runOutsideAngular(() => {
      try {
        paypal
          .Buttons({
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'paypal',
            },
            createOrder: (data: any, actions: any) => {
              // Usar el anticipo como valor de la transacción en lugar del monto total
              return actions.order.create({
                purchase_units: [
                  {
                    reference_id: 'default',
                    description: this.Detalles?.nombre,
                    amount: {
                      currency_code: 'MXN',
                      value: this.anticipo.toFixed(2), // Mostrar solo el anticipo a pagar
                    },
                  },
                ],
              });
            },
            onApprove: async (data: any, actions: any) => {
              try {
                this.isLoading = true;

                // Capturar el pago de PayPal
                const order = await actions.order.capture();
                console.log('Pago completado:', order);

                localStorage.setItem('mostrarRecomendadosVentaVestido', 'true');
                this.location.back();

                // Crear transacción y enviar la información al backend
                // Crear transacción y enviar la información al backend
                const rentaDetails = {
                  idUsuario: this.usuarioId,
                  nombreSolicitante: this.nombreSolicitante,
                  arrendatario: this.arrendatario,
                  fechaInicio: this.fechaInicio,
                  fechaFin: this.fechaFin,
                  direccionInmueble: this.direccionInmueble,
                  montoRenta: this.montoRenta,
                  anticipo: this.anticipo,
                  productId: this.productId,
                  tipoTransaccion: 'renta',
                  montoTotal: this.montoRenta || this.anticipo,
                  detallesPago: {
                    metodoPago: 'paypal',
                  },
                  transactionDetails: {
                    estadoPago:
                      this.anticipo === this.montoRenta
                        ? 'pagado_total'
                        : 'pagado_parcial',
                    cantidadPagada: this.anticipo,
                    metodoPago: 'paypal',

                    fechaUltimoPago: new Date().toISOString(),
                    idTransaccionPasarela: order.id,
                  },
                  detallesRenta: {
                    // Asegúrate de que estos valores sean correctos
                    fechaInicioRenta: this.fechaInicio,
                    fechaFinRenta: this.fechaFin,
                    depositoGarantia: this.anticipo, // El anticipo puede servir como garantía
                  },

                  idVestido: this.productId,
                };

                // Llamada al servicio para crear la transacción en el backend
                this.transactionService
                  .createTransaction(rentaDetails)
                  .subscribe({
                    next: (response) => {
                      this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Transacción registrada exitosamente.',
                      });
                    },
                    error: (err) => {
                      console.error('Error al registrar transacción:', err);
                      this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo registrar la transacción.',
                      });
                    },
                  });
              } catch (captureError) {
                console.error(
                  'Error durante la captura del pedido:',
                  captureError
                );
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al procesar el pago.',
                });
              } finally {
                this.isLoading = false;
              }
            },
            onError: (err: any) => {
              console.error('Error de PayPal:', err);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail:
                  'Error con PayPal, verifique aver ingresado los datos correctamente',
              });
            },
          })
          .render(this.paypalElement.nativeElement);
      } catch (error) {
        console.error('Error al renderizar el botón de PayPal:', error);
      }
    });
  }

  volver() {
    this.location.back();
  }
}
