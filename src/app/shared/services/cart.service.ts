import { Injectable, signal, computed } from '@angular/core';
import { Subject } from 'rxjs';
import { IndexedDbService } from '../../modules/public/commons/services/indexed-db.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private dressItemsSignal = signal<any[]>([]);
  dressItemCount = computed(() => this.dressItemsSignal().length);

  private cartUpdated = new Subject<void>();
  cartUpdated$ = this.cartUpdated.asObservable();

  // Bandera para saber si ya se cargó el carrito
  private isInitialized = signal(false);

  constructor(private indexedDbService: IndexedDbService) {
    this.initialize(); // Inicializa correctamente
  }

  

  // Inicializa el carrito correctamente esperando la carga
  private async initialize() {
    try {
      const items = await this.indexedDbService.obtenerProductosApartados();
      this.dressItemsSignal.set(items);
      this.isInitialized.set(true);
      console.log("✅ Carrito inicializado con productos:", items);
    } catch (error) {
      console.error("❌ Error al inicializar el carrito:", error);
    }
  }

  // Método para agregar un producto al carrito
  async addToCart(producto: any) {
    if (!this.isInitialized()) {
      console.warn("⏳ El carrito aún no ha sido inicializado");
      return;
    }

    console.log("🛒 Intentando agregar producto al carrito:", producto);

    const currentItems = this.dressItemsSignal();
    const isProductInCart = currentItems.some(item => item.id === producto.id);

    if (isProductInCart) {
      console.warn("⚠️ El producto ya está en el carrito");
      return;
    }

    this.dressItemsSignal.set([...currentItems, producto]);
    console.log("✅ Producto agregado al carrito (señal):", producto);

    try {
      await this.indexedDbService.guardarProducto(producto);
      console.log("💾 Producto guardado en IndexedDB:", producto);

      this.cartUpdated.next();
      console.log("📣 Notificación de cambio en el carrito enviada");
    } catch (error) {
      console.error("❌ Error al guardar el producto en IndexedDB:", error);
    }
  }

  // Método para eliminar un producto del carrito
  async removeFromCart(id: string) {
    const currentItems = this.dressItemsSignal();
    const updatedItems = currentItems.filter(item => item.id !== id);

    this.dressItemsSignal.set(updatedItems);
    console.log("🗑️ Producto eliminado del carrito:", updatedItems);

    await this.indexedDbService.eliminarProducto(id);
    console.log("💾 Producto eliminado de IndexedDB con ID:", id);

    this.cartUpdated.next();
  }

  // Método para obtener los productos actuales
  getCartItems() {
    return this.dressItemsSignal();
  }

  // Inicializar manualmente (si necesitas usarlo en tests)
  initializeCart(items: any[]) {
    this.dressItemsSignal.set(items);
  }
  // agrega una funcion para limpiar el carrito 
  async clearCart() {
    this.dressItemsSignal.set([]);
    await this.indexedDbService.limpiarCarrito();
    this.cartUpdated.next();
    console.log("🧹 Carrito limpiado");
  }
}
