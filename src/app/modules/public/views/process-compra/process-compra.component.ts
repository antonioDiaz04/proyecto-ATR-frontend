import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  NgZone,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { SessionService } from './../../../../shared/services/session.service';
import { TransactionService } from './../../../../shared/services/transaction.service';
import { environment } from '../../../../../environments/environment';
import { ProductoService } from '../../../../shared/services/producto.service';

declare const paypal: any;

@Component({
  selector: 'app-process-compra',
  templateUrl: './process-compra.component.html',
})
export class ProcessCompraComponent implements OnInit {
  isLoading: boolean = false;

  // Variables del producto
  productId: string = '';
  Detalles: any;

  mostrarModalRecomendados = false;

  // Variables del formulario de renta
  arrendador: string = '';
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
    private messageService: MessageService,
    private ngZone: NgZone,
    private sessionService: SessionService,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.scrollToTop();

    this.generarToken(); // Generamos el token antes de enviar los datos

    this.productId = this.activatedRoute.snapshot.params['id'];

    this.productoS_.obtenerDetalleProductoById(this.productId).subscribe({
      next: (response) => {
        this.isLoading = false;

        this.Detalles = response;
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
  }

  abrirModal() {
    this.mostrarModalRecomendados = true;
  }

  cerrarModal() {
    this.mostrarModalRecomendados = false;
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
        console.log('Detalles del producto:', this.Detalles);
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
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Método de submit del formulario
  onSubmit(): void {
    this.isLoading = true; // Activamos el loader
    this.generarToken(); // Generamos el token antes de enviar los datos
  }

  // Método para generar el token y enviarlo al backend
  generarToken(): void {
    if ('serviceWorker' in navigator && this.swPush) {
      this.swPush
        .requestSubscription({ serverPublicKey: this.publicKey })
        .then((sub) => {
          const token = JSON.stringify(sub);

          this.enviarTokenAlBackend(token); // Enviar el token al backend
        })
        .catch((err) => {
          console.error('Error al suscribirse a notificaciones:', err);

          this.isLoading = false; // Desactiva el loader en caso de error
        });
    } else {
      console.error('Service Workers no están habilitados en este navegador.');
      this.isLoading = false; // Desactiva el loader si no es compatible
    }
  }

  // Método para enviar el token de notificación al backend
  enviarTokenAlBackend(token: string): void {
    this.http
      .post(`${environment.api}/enviar-notificacion/ejemplo`, {
        token,
      })
      .subscribe(
        () => console.log('Token enviado al backend correctamente'),
        (err) => console.error('Error al enviar el token al backend:', err)
      );
  }
  initializePayPal() {
    if (!this.paypalLoaded || !this.paypalElement?.nativeElement) {
      console.error('PayPal no está cargado o el elemento no existe');
      return;
    }

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
              return this.ngZone.run(() => {
                // Validar si usuario está logueado
                const idUser = this.sessionService.getId() ?? '';
                if (!idUser) {
                  this.ngZone.run(() => {
                    this.messageService.add({
                      severity: 'warn',
                      summary: 'No identificado',
                      detail:
                        'Por favor, inicia sesión para continuar con la compra.',
                    });
                  });
                  // Cancelar creación de orden
                  return Promise.reject('Usuario no identificado');
                }

                return actions.order.create({
                  purchase_units: [
                    {
                      description: this.Detalles?.nombre,
                      amount: {
                        currency_code: 'MXN',
                        value: this.Detalles?.precio,
                      },
                    },
                  ],
                });
              });
            },
            onApprove: async (data: any, actions: any) => {
              await this.ngZone.run(async () => {
                try {
                  this.isLoading = true;

                  const idUser = this.sessionService.getId() ?? '';
                  if (!idUser) {
                    this.messageService.add({
                      severity: 'warn',
                      summary: 'No identificado',
                      detail:
                        'Por favor, inicia sesión para continuar con la compra.',
                    });
                    this.isLoading = false;
                    return;
                  }

                  const order = await actions.order.capture();

                  localStorage.setItem(
                    'mostrarRecomendadosVentaVestido',
                    'true'
                  );
                  this.location.back();

                  console.log('Payment completed:', order);

                  const ventaPayload = {
                    idUsuario: idUser,
                    idVestido: this.productId,
                    tipoTransaccion: 'venta',
                    montoTotal: this.Detalles?.precioActual,
                    estado: 'completada',
                    detallesPago: {
                      estadoPago: 'pagado_total',
                      cantidadPagada: this.Detalles?.precioActual,
                      metodoPago: 'paypal',
                      fechaUltimoPago: new Date().toISOString(),
                      idTransaccionPasarela: order.id,
                    },
                    detallesEntregaLocal: {},
                  };

                  this.transactionService
                    .createTransaction(ventaPayload)
                    .subscribe({
                      next: (response) => {
                        console.log(response);

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
                } catch (error) {
                  console.error('Payment error:', error);
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al procesar el pago.',
                  });
                } finally {
                  this.isLoading = false;
                }
              });
            },
            onError: (err: any) => {
              this.ngZone.run(() => {
                console.error('PayPal error:', err);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error con PayPal.',
                });
              });
            },
          })
          .render(this.paypalElement.nativeElement);
      } catch (error) {
        console.error('Error rendering PayPal button:', error);
      }
    });
  }
  ngAfterViewInit(): void {
    const mostrar = localStorage.getItem('mostrarRecomendadosVentaVestido');
    if (mostrar === 'true') {
      this.mostrarModalRecomendados = true;
      localStorage.removeItem('mostrarRecomendadosVentaVestido');
    }
  }
  verProducto(_id: any) {
    this.router.navigate([`/Detail/${_id}`]);
  }
  volver() {
    this.location.back();
  }
}
