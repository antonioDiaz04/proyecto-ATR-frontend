import { Component, OnInit } from "@angular/core";
import { IndexedDbService } from "../../commons/services/indexed-db.service";
import { Router } from "@angular/router";
import { SessionService } from "../../../../shared/services/session.service";
import { ERol } from "../../../../shared/constants/rol.enum";
import { CartService } from "../../../../shared/services/cart.service";
import { Location } from "@angular/common";
import { NotificacionService } from "../../../../shared/services/notification.service";
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
  confirmarCompra(){}
  constructor(
    private notificacionService_:NotificacionService,
    private location: Location,
    private sessionService: SessionService,
    private indexedDbService: IndexedDbService,
    private router: Router,
    private cartService: CartService // Inyecta el servicio CartService
  ) {}

  async ngOnInit() {
    try {
      this.enviarNotificacion();
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
      console.log("=>"+productos)

      this.calcularTotal();
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

  enviarNotificacion() {
    this.notificacionService_.enviarNotificacionLlevateCarrito().subscribe(
      (response) => {
        console.log("Notificación enviada:", response);
        // Aquí puedes manejar la respuesta de la API si es necesario
      },
      (error) => {
        console.error("Error al enviar la notificación:", error);
        // Manejo de errores
      }
    );
  }

  
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

  continuarCompraTotal() {}
}