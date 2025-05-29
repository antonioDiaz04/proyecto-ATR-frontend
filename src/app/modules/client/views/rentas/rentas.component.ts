import { Component, OnInit } from "@angular/core";
import { SessionService } from "../../../../shared/services/session.service";
import { VentayrentaService } from "../../../../shared/services/ventayrenta.service";
import { ERol } from "../../../../shared/constants/rol.enum";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { NotificacionService } from "../../../../shared/services/notification.service";
import { SwPush } from "@angular/service-worker";
import { environment } from "../../../../../environments/environment";
import { IndexedDbService } from "../../../public/commons/services/indexed-db.service";


@Component({
  selector: "app-rentas",
  templateUrl: "./rentas.component.html",
})
export class RentasComponent implements OnInit {
  userROL!: string;
  userData!: string;
  searchTerm: string = "";
  bolsaDeRentas: any[] = [];

  totalCompras = {
    subtotal: 850,
    impuestos: 136,
    envio: 50,
    totalPagar: 1036,
  };

  publicKey: string = environment.publicKey;
  pushPermission: NotificationPermission = 'default';
  pushSupportInfo: { supported: boolean; message: string } = { supported: false, message: '' };

  constructor(
    private location: Location,
    private router: Router,
    private sessionService: SessionService,
    private comprayrentaS_: VentayrentaService,
    private notificacionService_: NotificacionService,
    private swPush: SwPush,
        private indexedDbService: IndexedDbService,
    
  ) {}

  async ngOnInit() {
    if (this.isUserLoggedIn()) {
      this.obtenerComprasById(this.userData);
    }

    this.checkPushSupport();
    this.requestPushPermission();
  }

  isUserLoggedIn(): boolean {
    const userData = this.sessionService.getUserData();
    if (userData) {
      this.userData = userData._id;
      this.userROL = userData.rol;
      return this.userROL === ERol.CLIENTE;
    }
    return false;
  }
  get filteredProducts() {
    return this.bolsaDeRentas.filter((renta) =>
      renta.producto?.nombre?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  obtenerComprasById(usuarioId: any): void {
    this.comprayrentaS_
      .obtenerProductosRentadosByIdUser(usuarioId)
      .subscribe({
        next: (response) => {
          this.bolsaDeRentas = Array.isArray(response) ? response : [];
        },
        error: (error) => {
          console.error("Error al obtener rentas:", error);
          this.showErrorAlert("No se pudo cargar la información de tus rentas.");
        }
      });
  }

  volver(): void {
    this.location.back();
  }

  verDetalles(id: string): void {
    this.router.navigate(["/Detail/" + id]);
  }

   private checkPushSupport(): void {
    console.log("✅ checkPushSupport");
    const info = this.getPushSupportInfo();
    this.pushSupportInfo = info;
    this.pushPermission = Notification.permission;
    console.log("Estado de notificaciones:", info);
  }
  private getPushSupportInfo(): { supported: boolean; message: string } {
    console.log("✅ getPushSupportInfo");
    if (!('serviceWorker' in navigator)) {
      return { supported: false, message: 'Service Workers no soportados en este navegador' };
    }
    if (!('PushManager' in window)) {
      return { supported: false, message: 'Push API no soportada en este navegador' };
    }
    if (!this.swPush || !this.swPush.isEnabled) {
      return { supported: false, message: 'Notificaciones push deshabilitadas' };
    }
    // if (this.isIos()) {
    //   return { supported: false, message: 'iOS tiene limitaciones con notificaciones push en PWAs' };
    // }
    // if (this.isLocalhost() && !this.isSecure()) {
    //   return { supported: false, message: 'Se requiere HTTPS para notificaciones push' };
    // }
    return { supported: true, message: 'Notificaciones push soportadas' };
  }
async requestPushPermission(): Promise<void> {
    console.log("✅ requestPushPermission");
    if (!this.pushSupportInfo.supported) {
      this.showErrorAlert(this.pushSupportInfo.message);
      return;
    }

    try {
      const registration = await this.registerServiceWorker();

      // 🔁 Eliminar suscripción anterior si ya existe
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
        console.log("✅ Suscripción anterior eliminada");
      }

      const permission = await Notification.requestPermission();
      this.pushPermission = permission;

      if (permission !== 'granted') {
        this.showWarningAlert('Has bloqueado las notificaciones en tu navegador');
        return;
      }

      const newSubscription = await this.swPush.requestSubscription({
        serverPublicKey: this.publicKey
      });

      // ✅ Guardar la suscripción en IndexedDB
      await this.indexedDbService.guardarSuscripcion(newSubscription);

      await this.enviarNotificacion(newSubscription);
      this.showSuccessAlert('Notificaciones habilitadas con éxito');

    } catch (error) {
      this.handlePushError(error);
    }
  }

  private async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    console.log("✅ registerServiceWorker");
    try {
      if (navigator.serviceWorker.controller) {
        return navigator.serviceWorker.ready;
      }
      const registration = await navigator.serviceWorker.register('ngsw-worker.js', { scope: '/' });
      console.log('Service Worker registrado:', registration);
      return registration;
    } catch (error) {
      throw new Error('No se pudo registrar el Service Worker');
    }
  }

  private showErrorAlert(message: string): void {
    alert(`❌ Error: ${message}`);
  }

  private showWarningAlert(message: string): void {
    alert(`⚠ Advertencia: ${message}`);
  }

  private showSuccessAlert(message: string): void {
    alert(`✅ Éxito: ${message}`);
  }

 private handlePushError(error: unknown): void {
    console.log("✅ handlePushError", error);
    const msg = error instanceof Error ? error.message : String(error);
    const alertMsg = msg.includes('denied') ? 'Permiso denegado para notificaciones' :
      msg.includes('service worker') ? 'Error en el Service Worker. Recarga la página' :
      msg.includes('VAPID') ? 'Error de configuración de notificaciones' : msg;
    this.showErrorAlert(alertMsg);
  }


  enviarNotificacion(token: PushSubscription): Promise<void> {
    return new Promise((resolve, reject) => {
      this.notificacionService_.enviarNotificacionRecordatorioDevolucionRenta(token).subscribe({
        next: (response) => {
          console.log("Notificación enviada:", response);
          resolve();
        },
        error: (error) => {
          console.error("Error al enviar la notificación:", error);
          reject(error);
        }
      });
    });
  }
}
