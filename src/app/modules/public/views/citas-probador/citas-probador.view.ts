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
  categoria: string; // Asegúrate de que la interfaz incluya la propiedad `categoria`
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
  publicKey: string = environment.publicKey; // Este es el valor que debes obtener en la consola de Firebase.

  confirmarCompra() { }
  constructor(
    private http: HttpClient,
    private swPush: SwPush,
    private notificacionService_: NotificacionService,
    private location: Location,
    private sessionService: SessionService,
    private indexedDbService: IndexedDbService,
    private router: Router,
    private cartService: CartService // Inyecta el servicio CartService
  ) { }

  async ngOnInit() {
    try {
      this.generarToken();
      // Obtener productos desde IndexedDB
      const productos = await this.indexedDbService.obtenerProductosApartados();

      // Mostrar en consola los productos obtenidos de IndexedDB
      console.log("Productos obtenidos de IndexedDB:", productos);
      console.table(productos); // Esto mostrará los datos en formato de tabla

      // Corregir el filtrado (nota la propiedad y el valor exacto)
      this.productosRenta = productos.filter(
        (item) => item.opcionesTipoTransaccion?.toLowerCase() === "renta"
      );
      this.productosVenta = productos.filter(
        (item) => item.opcionesTipoTransaccion?.toLowerCase() === "venta"
      );

      // Inicializar el carrito con los productos obtenidos
      this.cartService.initializeCart(productos);
      // const productos =this.cartService.loadCartItems();
      console.log("=>" + productos)

      // this.calcularTotal();
      this.initializeTabs();
    } catch (error) {
      console.error("Error al obtener productos apartados:", error);
    }
  }

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
  generarToken(): void {
    const esLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const esSeguro = location.protocol === 'https:' || esLocal;
  
    if (!esSeguro) {
      console.error('Las notificaciones push solo funcionan en sitios HTTPS o localhost.');
      alert('Debes acceder mediante HTTPS o localhost para usar notificaciones.');
      return;
    }
  
    if (!('serviceWorker' in navigator)) {
      console.error('Este navegador no soporta Service Workers.');
      alert('Tu navegador no soporta notificaciones push.');
      return;
    }
  
    if (!this.swPush || !this.swPush.isEnabled) {
      console.warn('Push notifications no están habilitadas en este navegador.');
      return;
    }
  
    Notification.requestPermission().then((permiso) => {
      if (permiso !== 'granted') {
        console.warn('Permiso de notificaciones no concedido:', permiso);
        alert('Debes permitir notificaciones para recibir alertas.');
        return;
      }
  
      navigator.serviceWorker.register('ngsw-worker.js') // Asegúrate que esta ruta sea correcta
        .then(() => {
          this.swPush.requestSubscription({ serverPublicKey: this.publicKey })
            .then((sub) => {
              // const token = JSON.parse(sub));
              this.enviarNotificacion(sub);
              console.log('Suscripción push exitosa:', sub);
            })
            .catch((err) => {
              console.error('Error al suscribirse a notificaciones:', err);
              if (err instanceof Error) {
                console.error('Detalles del error:', err.message, err.stack);
              }
              alert('Hubo un problema al suscribirse a las notificaciones.');
            });
        })
        .catch((error) => {
          console.error('Error al registrar el Service Worker:', error);
          alert('Fallo el registro del Service Worker. Revisa la consola para más detalles.');
        });
    });
  }
  

  // Método para enviar el token de notificación al backend
  enviarNotificacion(token: PushSubscription): void {
    this.notificacionService_.enviarNotificacionLlevateCarrito(token).subscribe(
      (response) => {
        console.log("Notificación enviada:", response);
        // Aquí puedes manejar la respuesta de la API si es necesario
      },
      (error) => {
        console.error("Error al enviar la notificación:", error);
        if (error instanceof Error) {
          console.error('Detalles del error al enviar notificación:', error.message, error.stack);
        }
        // Manejo de errores
        if (error.status) {
          console.error(`Status de error: ${error.status}`);
        }
        if (error.error) {
          console.error('Respuesta del error:', error.error);
        }
      }
    );
  }






  // enviarNotificacion() {
  //   this.notificacionService_.enviarNotificacionLlevateCarrito().subscribe(
  //     (response) => {
  //       console.log("Notificación enviada:", response);
  //       // Aquí puedes manejar la respuesta de la API si es necesario
  //     },
  //     (error) => {
  //       console.error("Error al enviar la notificación:", error);
  //       // Manejo de errores
  //     }
  //   );
  // }


  async deleteDressItem(id: string) {
    try {

      // Eliminar el producto de las listas locales
      this.productosRenta = this.productosRenta.filter(
        (item) => item.id !== id
      );
      this.productosVenta = this.productosVenta.filter(
        (item) => item.id !== id
      );

      // Eliminar el producto del carrito
      this.cartService.removeFromCart(id);

      // Recalcular el total
      this.calcularTotal();
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
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
      alert("Acceso denegado. Solo los clientes pueden iniciar sesión.");
    }
  }

  mostrarResumen(item: any) {
    this.productoSeleccionado = item;
    this.mostrarModal = true;
  }

  continuarCompraTotal() { }
}