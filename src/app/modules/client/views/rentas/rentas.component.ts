import { Component, OnInit } from "@angular/core";
import { SessionService } from "../../../../shared/services/session.service";
import { VentayrentaService } from "../../../../shared/services/ventayrenta.service";
import { ERol } from "../../../../shared/constants/rol.enum";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { NotificacionService } from "../../../../shared/services/notification.service";
import { SwPush } from "@angular/service-worker";
import { environment } from "../../../../../environments/environment";

interface UserData {
  _id: string;
  rol: ERol;
}

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
    private swPush: SwPush
  ) {}

  ngOnInit(): void {
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
    this.pushSupportInfo = this.getPushSupportInfo();
    this.pushPermission = Notification.permission;
    console.log("Estado de notificaciones:", this.pushSupportInfo);
  }

  private getPushSupportInfo(): { supported: boolean; message: string } {
    const info = {
      supported: true,
      message: "Notificaciones push soportadas"
    };

    if (!('serviceWorker' in navigator)) {
      return { supported: false, message: "Service Workers no soportados en este navegador" };
    }

    if (!('PushManager' in window)) {
      return { supported: false, message: "Push API no soportada en este navegador" };
    }

    if (!this.swPush || !this.swPush.isEnabled) {
      return { supported: false, message: "Push notifications deshabilitadas en este entorno" };
    }

    return info;
  }

  async requestPushPermission(): Promise<void> {
    if (!this.pushSupportInfo.supported) {
      this.showErrorAlert(this.pushSupportInfo.message);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      this.pushPermission = permission;

      if (permission === 'granted') {
        const sub = await this.swPush.requestSubscription({
          serverPublicKey: this.publicKey
        });

        await this.enviarNotificacion(sub);
        this.showSuccessAlert("Notificaciones habilitadas con éxito");
      } else if (permission === 'denied') {
        this.showWarningAlert("Has bloqueado las notificaciones. Puedes cambiar esto en la configuración de tu navegador.");
      }
    } catch (error) {
      console.error("Error en requestPushPermission:", error);
      this.handlePushError(error);
    }
  }

  private async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    try {
      const workerUrl = 'ngsw-worker.js';

      if (navigator.serviceWorker.controller) {
        return navigator.serviceWorker.ready;
      }

      const registration = await navigator.serviceWorker.register(workerUrl, {
        scope: '/',
        type: 'module'
      });

      console.log("Service Worker registrado:", registration);
      return registration;
    } catch (error) {
      console.error("Error registrando Service Worker:", error);
      throw new Error(`No se pudo registrar el Service Worker: ${error instanceof Error ? error.message : String(error)}`);
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
    let message = "Error desconocido al configurar notificaciones";

    if (error instanceof Error) {
      if (error.message.includes("denied")) {
        message = "Permiso denegado para notificaciones";
      } else if (error.message.includes("service worker")) {
        message = "Error en el Service Worker. Recarga la página e intenta nuevamente.";
      } else if (error.message.includes("VAPID")) {
        message = "Error de configuración. Contacta al soporte técnico.";
      } else {
        message = error.message;
      }
    }

    this.showErrorAlert(message);
    console.error("Detalles del error:", error);
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
