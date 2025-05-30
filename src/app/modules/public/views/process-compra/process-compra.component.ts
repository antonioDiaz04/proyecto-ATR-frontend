import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  NgZone,
} from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { SwPush } from '@angular/service-worker';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../../../shared/services/producto.service';
import { HttpClient } from '@angular/common/http';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, MessageService } from 'primeng/api';
declare const paypal: any;
import { Location } from '@angular/common';

@Component({
  selector: 'app-process-compra',
  templateUrl: './process-compra.component.html',
})
export class ProcessCompraComponent implements OnInit {
  isLoading: boolean = false;
  productId: string = '';
  Detalles: any;

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
    private ngxService: NgxUiLoaderService,
    private messageService: MessageService,
    private ngZone: NgZone
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
          console.log('enviar=>', token);
          const data = {
            arrendador: this.arrendador,
            arrendatario: this.arrendatario,
            fechaInicio: this.fechaInicio,
            fechaFin: this.fechaFin,
            direccionInmueble: this.direccionInmueble,
            montoRenta: this.montoRenta,
            productId: this.productId,
            token: token, // Token generado
          };

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

    // Ejecutar fuera de Angular Zone para evitar problemas
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
                  const order = await actions.order.capture();
                  console.log('Payment completed:', order);
                  // Manejar pago exitoso
                } catch (error) {
                  console.error('Payment error:', error);
                  // Manejar error
                } finally {
                  this.isLoading = false;
                }
              });
            },
            onError: (err: any) => {
              this.ngZone.run(() => {
                console.error('PayPal error:', err);
                // Manejar error
              });
            },
          })
          .render(this.paypalElement.nativeElement);
      } catch (error) {
        console.error('Error rendering PayPal button:', error);
      }
    });
  }
  volver() {
    this.location.back();
  }
}
