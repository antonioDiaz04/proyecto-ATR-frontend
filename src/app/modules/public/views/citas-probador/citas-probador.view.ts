import { Component, OnInit } from "@angular/core";
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
declare const $: any;

export interface DressItem {
  id: string;
  nombre: string;
  precio: number;
  imagenes: any;
  categoria: string;
}

@Component({
  selector: "app-citas-probador",
  templateUrl: "./citas-probador.view.html",
})
export class CitasProbadorView implements OnInit {
  productosRenta: DressItem[] = [];
  productosVenta: DressItem[] = [];
  tipoCompra: string = "renta";
  totalCompra: number = 0;
  isLoggedIn: boolean = false;
  name: string = "";
  lastName: string = "";
  email: string = "";
  mostrarModal: boolean = false;
  productoSeleccionado: DressItem | null = null;
  selectedProductoRenta: DressItem | null = null;
  selectedProductoVenta: DressItem | null = null;
  userROL!: string;
  publicKey: string = environment.publicKey;
  pushPermission: NotificationPermission = 'default';
  pushSupportInfo: {supported: boolean, message: string} = {supported: false, message: ''};

  constructor(
    private http: HttpClient,
    private swPush: SwPush,
    private notificacionService_: NotificacionService,
    private location: Location,
    private sessionService: SessionService,
    private indexedDbService: IndexedDbService,
    private router: Router,
    private cartService: CartService
  ) { }

  async ngOnInit() {
    try {
      this.checkPushSupport();
      
      // Obtener productos desde IndexedDB
      const productos = await this.indexedDbService.obtenerProductosApartados();
      console.log("Productos obtenidos de IndexedDB:", productos);
      
      this.productosRenta = productos.filter(
        (item) => item.opcionesTipoTransaccion?.toLowerCase() === "renta"
      );
      this.productosVenta = productos.filter(
        (item) => item.opcionesTipoTransaccion?.toLowerCase() === "venta"
      );

      this.cartService.initializeCart(productos);
      this.initializeTabs();
    } catch (error) {
      console.error("Error al obtener productos apartados:", error);
      this.showErrorAlert("Error al cargar los productos");
    }
  }

  /**
   * Verifica el soporte para notificaciones push
   */
  private checkPushSupport(): void {
    this.pushSupportInfo = this.getPushSupportInfo();
    this.pushPermission = Notification.permission;
    console.log('Estado de notificaciones:', this.pushSupportInfo);
  }

  /**
   * Obtiene información detallada sobre el soporte de push
   */
  private getPushSupportInfo(): {supported: boolean, message: string} {
    const info = {
      supported: true,
      message: 'Notificaciones push soportadas'
    };

    // Verificar características necesarias
    if (!('serviceWorker' in navigator)) {
      info.supported = false;
      info.message = 'Service Workers no soportados en este navegador';
      return info;
    }

    if (!('PushManager' in window)) {
      info.supported = false;
      info.message = 'Push API no soportada en este navegador';
      return info;
    }

    if (!this.swPush || !this.swPush.isEnabled) {
      info.supported = false;
      info.message = 'Push notifications deshabilitadas en la configuración del navegador';
      return info;
    }

    // Verificar si es iOS (tiene limitaciones)
    if (this.isIos()) {
      info.supported = false;
      info.message = 'iOS tiene limitaciones con notificaciones push en PWAs';
      return info;
    }

    // Verificar si es localhost sin HTTPS
    if (this.isLocalhost() && !this.isSecure()) {
      info.supported = false;
      info.message = 'Se requiere HTTPS para notificaciones push (excepto en localhost)';
      return info;
    }

    return info;
  }

  /**
   * Solicita permiso para notificaciones push
   */
  async requestPushPermission(): Promise<void> {
    if (!this.pushSupportInfo.supported) {
      this.showErrorAlert(this.pushSupportInfo.message);
      return;
    }

    try {
      // Paso 1: Registrar Service Worker
      const registration = await this.registerServiceWorker();
      
      // Paso 2: Solicitar permiso
      const permission = await Notification.requestPermission();
      this.pushPermission = permission;
      
      if (permission === 'granted') {
        // Paso 3: Suscribirse a notificaciones
        const sub = await this.swPush.requestSubscription({
          serverPublicKey: this.publicKey
        });
        
        // Paso 4: Enviar suscripción al backend
        await this.enviarNotificacion(sub);
        
        this.showSuccessAlert('Notificaciones habilitadas con éxito');
              } else if (permission === 'denied') {
                this.showWarningAlert('Has bloqueado las notificaciones. Puedes cambiar esto en la configuración de tu navegador.');
      }
    } catch (error) {
      console.error('Error en requestPushPermission:', error);
      this.handlePushError(error);
    }
  }

  /**
   * Registra el Service Worker
   */
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
      
      console.log('Service Worker registrado:', registration);
      return registration;
    } catch (error) {
      console.error('Error registrando Service Worker:', error);
      throw new Error(`No se pudo registrar el Service Worker: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  // ========== NOTIFICACIONES PUSH ==========
  

  /**
   * Maneja errores de notificaciones push
   */
  private handlePushError(error: unknown): void {
    let message = 'Error desconocido al configurar notificaciones';
    
    if (error instanceof Error) {
      if (error.message.includes('denied')) {
        message = 'Permiso denegado para notificaciones';
      } else if (error.message.includes('service worker')) {
        message = 'Error en el Service Worker. Recarga la página e intenta nuevamente.';
      } else if (error.message.includes('VAPID')) {
        message = 'Error de configuración. Contacta al soporte técnico.';
      } else {
        message = error.message;
      }
    }
    
    this.showErrorAlert(message);
    console.error('Detalles del error:', error);
  }


  // ========== HELPERS ==========

  private isIos(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  private isLocalhost(): boolean {
    return ['localhost', '127.0.0.1'].includes(location.hostname);
  }

  private isSecure(): boolean {
    return location.protocol === 'https:' || this.isLocalhost();
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

  // ========== MÉTODOS EXISTENTES ==========

  volver() {
    this.location.back();
  }

  private initializeTabs() {
    if (typeof $ !== "undefined") {
      $(".menu .item").tab();
    } else {
      console.error("jQuery no está disponible.");
    }
  }
  confirmarCompra() {
    if (this.isUserLoggedIn()) {
      this.router.navigate(["/public/citas-probador/confirmar-compra"]);
    } else {
      this.showErrorAlert("Acceso denegado. Solo los clientes pueden realizar compras.");
    }
  }

  async deleteDressItem(id: string) {
    try {
      this.productosRenta = this.productosRenta.filter(item => item.id !== id);
      this.productosVenta = this.productosVenta.filter(item => item.id !== id);
      this.cartService.removeFromCart(id);
      this.calcularTotal();
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      this.showErrorAlert("Error al eliminar el producto");
    }
  }

  setTipoCompra(tipo: string) {
    this.tipoCompra = tipo;
    this.calcularTotal();
  }

  calcularTotal() {
    this.totalCompra =
      this.tipoCompra === "renta"
        ? this.productosRenta.reduce((total, item) => total + item.precio, 0)
        : this.productosVenta.reduce((total, item) => total + item.precio, 0);
  }

  isUserLoggedIn(): boolean {
    const userData = this.sessionService.getUserData();
    if (userData) {
      this.userROL = userData.rol;
      return this.userROL === ERol.CLIENTE;
    }
    return false;
  }

  continuarCompra(data: any, tipo: string): void {
    this.isLoggedIn = this.isUserLoggedIn();
    this.productoSeleccionado = data;
    
    if (this.isLoggedIn) {
      this.mostrarModal = true;
    } else {
      this.showErrorAlert("Acceso denegado. Solo los clientes pueden iniciar sesión.");
    }
  }

  mostrarResumen(item: any) {
    this.productoSeleccionado = item;
    this.mostrarModal = true;
  }

  continuarCompraTotal() { }

  // Método para enviar el token de notificación al backend
  enviarNotificacion(token: PushSubscription): Promise<void> {
    return new Promise((resolve, reject) => {
      this.notificacionService_.enviarNotificacionLlevateCarrito(token).subscribe({
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