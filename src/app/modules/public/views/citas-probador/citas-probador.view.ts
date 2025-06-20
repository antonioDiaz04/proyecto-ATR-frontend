import { Component, OnInit,OnDestroy  } from "@angular/core";
import { IndexedDbService } from "../../commons/services/indexed-db.service";
import { Router } from "@angular/router";
import { SessionService } from "../../../../shared/services/session.service";
import { ERol } from "../../../../shared/constants/rol.enum";
import { CartService } from "../../../../shared/services/cart.service";
import { Location } from "@angular/common";
import { NotificacionService } from "../../../../shared/services/notification.service";
import { SwPush } from "@angular/service-worker";
import { environment } from "../../../../../environments/environment";
import { HttpClient } from "@angular/common/http";

export interface DressItem {
  id: string;
  nombre: string;
  precio: number;
  imagenes: any;
  categoria: string;
  opcionesTipoTransaccion?: string;
}

@Component({
  selector: "app-citas-probador",
  templateUrl: "./citas-probador.view.html",
})
export class CitasProbadorView implements OnInit,OnDestroy  {
  productosRenta: DressItem[] = [];
  productosVenta: DressItem[] = [];
  tipoCompra: string = "renta";
  totalCompra: number = 0;
  isLoggedIn: boolean = false;
  productoSeleccionado: DressItem | null = null;
  mostrarModal: boolean = false;
  userROL: string = "";
  publicKey: string = environment.publicKey;
  pushPermission: NotificationPermission = 'default';
  pushSupportInfo = { supported: false, message: '' };

  constructor(
    private http: HttpClient,
    private swPush: SwPush,
    private notificacionService: NotificacionService,
    private location: Location,
    private sessionService: SessionService,
    private indexedDbService: IndexedDbService,
    private router: Router,
    private cartService: CartService
  ) {
    console.log("✅ constructor");
  }

  async ngOnInit() {
    console.log("✅ ngOnInit");

    try {
      const productos = await this.indexedDbService.obtenerProductosApartados();
      this.productosRenta = productos.filter(p => p.opcionesTipoTransaccion?.toLowerCase() === "renta");
      this.productosVenta = productos.filter(p => p.opcionesTipoTransaccion?.toLowerCase() === "venta");
      this.cartService.initializeCart(productos);
      this.calcularTotal();
      this.initializeTabs();
    } catch (error) {
      this.handleError("Error al cargar los productos", error);
    }
  }
  
  
  
 async ngOnDestroy() {
  console.log("✅ ngOnDestroy");

  // Asegúrate de que el soporte y permiso se revisen antes del timeout si lo necesitas
  this.checkPushSupport();

  setTimeout(async () => {
    console.log("⌛ 5 segundos después de ngOnDestroy");

    // Si quieres, puedes validar aquí antes de pedir permiso o enviar notificación
    if (!this.pushSupportInfo.supported) {
      console.warn("⛔ Notificaciones no soportadas");
      return;
    }

    await this.requestPushPermission(); // o cualquier otra lógica diferida
  }, 5000); // 5000 ms = 5 segundos
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
    if (this.isIos()) {
      return { supported: false, message: 'iOS tiene limitaciones con notificaciones push en PWAs' };
    }
    if (this.isLocalhost() && !this.isSecure()) {
      return { supported: false, message: 'Se requiere HTTPS para notificaciones push' };
    }
    return { supported: true, message: 'Notificaciones push soportadas' };
  }

  async requestPushPermission(): Promise<void> {
    console.log("✅ requestPushPermission");
    if (!this.pushSupportInfo.supported) {
      this.showErrorAlert(this.pushSupportInfo.message);
      return;
    }

    // try {
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
      // this.showSuccessAlert('Notificaciones habilitadas con éxito');

    
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

  private enviarNotificacion(token: PushSubscription): Promise<void> {
    console.log("✅ enviarNotificacion");
    return new Promise((resolve, reject) => {
      this.notificacionService.enviarNotificacionLlevateCarrito(token).subscribe({
        next: () => resolve(),
        error: reject
      });
    });
  }

  volver(): void {
    console.log("✅ volver");
    this.location.back();
  }

  confirmarCompra(): void {
    console.log("✅ confirmarCompra");
    if (this.isUserLoggedIn()) {
      this.router.navigate(["/public/citas-probador/confirmar-compra"]);
    } else {
      this.showErrorAlert("Solo los clientes pueden realizar compras");
    }
  }

  deleteDressItem(id: string): void {
    console.log("✅ deleteDressItem", id);
    this.productosRenta = this.productosRenta.filter(p => p.id !== id);
    this.productosVenta = this.productosVenta.filter(p => p.id !== id);
    this.cartService.removeFromCart(id);
    this.calcularTotal();
  }

  setTipoCompra(tipo: string): void {
    console.log("✅ setTipoCompra", tipo);
    this.tipoCompra = tipo;
    this.calcularTotal();
  }

  calcularTotal(): void {
    console.log("✅ calcularTotal");
    const productos = this.tipoCompra === 'renta' ? this.productosRenta : this.productosVenta;
    this.totalCompra = productos.reduce((total, item) => total + item.precio, 0);
  }

  isUserLoggedIn(): boolean {
    console.log("✅ isUserLoggedIn");
    const user = this.sessionService.getUserData();
    if (user) {
      this.userROL = user.rol;
      return this.userROL === ERol.CLIENTE;
    }
    return false;
  }

  continuarCompra(producto: DressItem): void {
    console.log("✅ continuarCompra", producto);
    this.isLoggedIn = this.isUserLoggedIn();
    if (this.isLoggedIn) {
      this.productoSeleccionado = producto;
      this.mostrarModal = true;
    } else {
      this.showErrorAlert("Solo los clientes pueden iniciar sesión");
    }
  }

  mostrarResumen(producto: DressItem): void {
    console.log("✅ mostrarResumen", producto);
    this.productoSeleccionado = producto;
    this.mostrarModal = true;
  }

  private initializeTabs(): void {
    console.log("✅ initializeTabs");
    const jQueryAvailable = typeof window !== 'undefined' && (window as any).$;
    if (jQueryAvailable) {
      (window as any).$('.menu .item').tab();
    }
  }

  private handlePushError(error: unknown): void {
    console.log("✅ handlePushError", error);
    const msg = error instanceof Error ? error.message : String(error);
    const alertMsg = msg.includes('denied') ? 'Permiso denegado para notificaciones' :
      msg.includes('service worker') ? 'Error en el Service Worker. Recarga la página' :
      msg.includes('VAPID') ? 'Error de configuración de notificaciones' : msg;
    this.showErrorAlert(alertMsg);
  }

  private handleError(message: string, error: unknown): void {
    console.log("✅ handleError", message, error);
    console.error(message, error);
    this.showErrorAlert(message);
  }

  private showErrorAlert(message: string): void {
    console.log("✅ showErrorAlert", message);
    alert(`❌ Error: ${message}`);
  }

  private showWarningAlert(message: string): void {
    console.log("✅ showWarningAlert", message);
    alert(`⚠ Advertencia: ${message}`);
  }

  private showSuccessAlert(message: string): void {
    console.log("✅ showSuccessAlert", message);
    alert(`✅ Éxito: ${message}`);
  }

  private isIos(): boolean {
    console.log("✅ isIos");
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  private isLocalhost(): boolean {
    console.log("✅ isLocalhost");
    return ['localhost', '127.0.0.1'].includes(location.hostname);
  }

  private isSecure(): boolean {
    console.log("✅ isSecure");
    return location.protocol === 'https:' || this.isLocalhost();
  }
}
