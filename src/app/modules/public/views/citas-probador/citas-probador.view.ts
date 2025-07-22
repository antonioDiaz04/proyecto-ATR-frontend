import { Component, OnInit,OnDestroy  } from "@angular/core";
import { IndexedDbService } from "../../commons/services/indexed-db.service";
import { Router } from "@angular/router";
import { SessionService } from "../../../../shared/services/session.service";
import { ERol } from "../../../../shared/constants/rol.enum";
import { CartService } from "../../../../shared/services/cart.service";
import { UsuarioService } from "../../../../shared/services/usuario.service";
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
    private usuarioService: UsuarioService,
    private cartService: CartService
  ) {
    console.log("✅ constructor");
  }

  idUsuario: string | any = null;
  async ngOnInit() {
    console.log("✅ ngOnInit");

    try {
      const productos = await this.indexedDbService.obtenerProductosApartados();
      console.log("📥 Productos obtenidos de IndexedDB:", productos);

      if (this.isUserLoggedIn()) {
        console.log("🔐 Usuario logueado");

        const user = this.sessionService.getUserData();
        this.idUsuario = user?._id;

        if (!this.idUsuario) {
          throw new Error("No se pudo obtener el id del usuario");
        }

        let carritoServidor: DressItem[] = [];

        try {
          const respuesta = await this.usuarioService.obtenerCarrito(this.idUsuario).toPromise();
          console.log("🖥️ Carrito obtenido del backend (raw):", respuesta);

          // Si el backend devuelve directamente un array:
          if (Array.isArray(respuesta)) {
            carritoServidor = respuesta;
          } else if (respuesta && Array.isArray(respuesta.productos)) {
            carritoServidor = respuesta.productos;
          } else {
            console.warn("⚠️ Respuesta inesperada del backend, usando carrito vacío");
          }
        } catch (err) {
          console.error("❌ Error al obtener carrito del backend:", err);
        }

        if (!carritoServidor || carritoServidor.length === 0) {
          console.log("📦 Backend sin productos, usando IndexedDB");

          this.productosRenta = productos.filter(
            (p) => p.opcionesTipoTransaccion?.toLowerCase() === "renta"
          );
          this.productosVenta = productos.filter(
            (p) => p.opcionesTipoTransaccion?.toLowerCase() === "venta"
          );

          if (productos.length > 0) {
            this.usuarioService
              .guardarCarrito(productos, this.idUsuario)
              .subscribe({
                next: () => console.log("🆗 Productos guardados en backend"),
                error: (err) => console.error("❌ Error al guardar productos nuevos", err),
              });
          }
        } else {
          console.log("🔄 Backend tiene productos, sincronizando...");

          const idsServidor = new Set(carritoServidor.map((p) => p.id));
          const productosNuevos = productos.filter((p) => !idsServidor.has(p.id));

          // for (let producto of productos) {
          //   if (idsServidor.has(producto.id)) {
          //     await this.indexedDbService.eliminarProducto(producto.id);
          //     console.log(`🧹 Producto duplicado eliminado de IndexedDB: ${producto.id}`);
          //   }
          // }

          const idsIndexedDb = new Set(productos.map((p) => p.id));
          const productosAEliminarEnBackend = carritoServidor.filter(
            (p) => !idsIndexedDb.has(p.id)
          );

          // for (let producto of productosAEliminarEnBackend) {
          //   await this.usuarioService.eliminarProductoCarrito(this.idUsuario, producto.id).toPromise();
          //   console.log(`🧹 Producto eliminado del backend: ${producto.id}`);
          // }

          this.productosRenta = productosNuevos.filter(
            (p) => p.opcionesTipoTransaccion?.toLowerCase() === "renta"
          );
          this.productosVenta = productosNuevos.filter(
            (p) => p.opcionesTipoTransaccion?.toLowerCase() === "venta"
          );

          if (productosNuevos.length > 0) {
            this.usuarioService
              .guardarCarrito(productosNuevos, this.idUsuario)
              .subscribe({
                next: () => console.log("🆗 Productos nuevos guardados en backend"),
                error: (err) => console.error("❌ Error al guardar productos nuevos", err),
              });
          }
        }
      } else {
        console.log("👤 Usuario no logueado, solo IndexedDB");

        this.productosRenta = productos.filter(
          (p) => p.opcionesTipoTransaccion?.toLowerCase() === "renta"
        );
        this.productosVenta = productos.filter(
          (p) => p.opcionesTipoTransaccion?.toLowerCase() === "venta"
        );
      }

      this.cartService.initializeCart([...this.productosRenta, ...this.productosVenta]);
      this.calcularTotal();
      this.initializeTabs();

    } catch (error) {
      this.handleError("Error al cargar los productos", error);
    }
  }



  // async ngOnInit() {
  //   console.log("✅ ngOnInit");

  //   try {
  //     const productos = await this.indexedDbService.obtenerProductosApartados();
  //     this.productosRenta = productos.filter(p => p.opcionesTipoTransaccion?.toLowerCase() === "renta");
  //     this.productosVenta = productos.filter(p => p.opcionesTipoTransaccion?.toLowerCase() === "venta");
  //     this.cartService.initializeCart(productos);
  //     this.calcularTotal();
  //     this.initializeTabs();
  //   } catch (error) {
  //     this.handleError("Error al cargar los productos", error);
  //   }
  // }



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

  title = 'Atelier protegue tus datos';
  isPrivacyModalOpen: boolean = false; // Estado para controlar la visibilidad del modal
  mostrarModalConfirmacion: boolean = false;
  aceptaTerminos: boolean = false;


  openPrivacyModal(): void {
    this.isPrivacyModalOpen = true;
  }

  onPrivacyModalClose(): void {
    this.isPrivacyModalOpen = false;
  }

  // showDialog() {
  //   this.sidebarVisible = true;
  // }

  redirectTo(route: string): void {
    console.log(route);
    if (route === 'login') {
      this.router.navigate(['/auth/login']);
    } else {
      console.log("click", route);
      this.router.navigate(['/', route]);
    }
  }

  mostrarConfirmacion() {
    this.mostrarModalConfirmacion = true;
    this.aceptaTerminos = false; // reiniciar cada vez que abre
  }

  // Cerrar modal
  cerrarModal() {
    this.mostrarModalConfirmacion = false;
  }

  // Abrir modal de privacidad
  abrirPrivacyModal() {
    this.isPrivacyModalOpen = true;
  }

  // Cerrar modal de privacidad
  // onPrivacyModalClose() {
  //   this.isPrivacyModalOpen = false;
  // }
  guardando: boolean = false;


  // Guardar carrito para usuario logueado
  guardarCarrito(): void {
    if (!this.aceptaTerminos) return;

    const carrito = [...this.productosRenta, ...this.productosVenta];
    if (!carrito.length) {
      this.showWarningAlert("Tu carrito está vacío");
      return;
    }

    this.guardando = true;

    this.usuarioService.guardarCarrito(carrito).subscribe({
      next: () => {
        console.log("✅ Carrito enviado al backend.");
        this.mostrarNotificacion = true;
        setTimeout(() => {
          this.mostrarNotificacion = false;
        }, 4000);
        this.cerrarModal();
      },
      error: (error) => {
        console.error("❌ Error al guardar el carrito", error);
        this.showErrorAlert("Error al guardar tu carrito en el servidor");
      },
      complete: () => {
        this.guardando = false;
      }
    });
  }

  vaciarCarrito(): void {
    const confirmacion = confirm("¿Estás seguro de que deseas vaciar el carrito?");
    if (!confirmacion) return;

    this.usuarioService.vaciarCarrito().subscribe({
      next: () => {
        this.cartService.clearCart();
        this.productosRenta = [];
        this.productosVenta = [];
        this.totalCompra = 0;
        this.showSuccessAlert("Carrito vaciado correctamente");
      },
      error: (err) => {
        console.error("❌ Error al vaciar el carrito", err);
        this.showErrorAlert("No se pudo vaciar el carrito en el servidor");
      }
    });
  }

  // Redirigir al login si no está logueado
  redirigirLogin() {
    if (!this.aceptaTerminos) return;
    this.router.navigate(['/auth/login']);
  }

  // now 

  scannerActivo = false;
  vincularMensaje = '';
  vincularExito = false;
  wearToken: string = '';
  wearDeviceId: string = '';
  usuarioActualId: string = '';

  activarScanner() {
    this.vincularMensaje = '';
    this.vincularExito = false;
    this.scannerActivo = true;
  }

  vincularDispositivo() {
    const payload = {
      usuarioId: this.usuarioActualId,
      token: this.wearToken,
      deviceId: this.wearDeviceId,
    };

    console.log(payload);
    this.usuarioService.vincularDispositivo(payload).subscribe({
      next: () => {
        this.vincularExito = true;
        this.vincularMensaje = '¡Dispositivo vinculado exitosamente!';
      },
      error: (err) => {
        console.error(err);
        this.vincularExito = false;
        this.vincularMensaje = 'Error al vincular el dispositivo.';
      },
    });
  }

  onCodeResult(result: any) {
    this.scannerActivo = false;
    const partes = result.split('|');

    if (partes.length === 2) {
      this.wearToken = partes[0];
      this.wearDeviceId = partes[1];

      const usuarioId = this.sessionService.getId(); // O donde guardes tu sesión
      if (usuarioId) {
        this.usuarioActualId = usuarioId;
        this.vincularDispositivo();
      } else {
        this.vincularMensaje = 'No se pudo obtener el ID del usuario';
        this.vincularExito = false;
      }
    } else {
      this.vincularMensaje = 'QR inválido';
      this.vincularExito = false;
    }
  }
  iniciarRegistro() {

  }


  mostrarNotificacion: boolean = false;

}