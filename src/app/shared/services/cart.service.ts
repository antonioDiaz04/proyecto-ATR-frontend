import { Injectable, signal, computed } from '@angular/core';
import { IndexedDbService } from '../../modules/public/commons/services/indexed-db.service';

export interface CartItem {
  _id: string;
  nombre: string;
  precio: number;
  imagenes: string[];
  opcionesTipoTransaccion: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {

  private itemsSignal = signal<CartItem[]>([]);
  items = this.itemsSignal.asReadonly();

  itemCount = computed(() => this.itemsSignal().length);

  totalPrice = computed(() =>
    this.itemsSignal().reduce((total, item) => total + (item.precio || 0), 0)
  );

  private isInitialized = signal(false);

  constructor(private indexedDbService: IndexedDbService) {
    this.initialize();
  }

  // =============================
  // Inicializar carrito
  // =============================
  private async initialize() {
    try {
      const items = await this.indexedDbService.obtenerProductosApartados();
      this.itemsSignal.set(items);
      this.isInitialized.set(true);
      console.log("Carrito inicializado:", items);
    } catch (error) {
      console.error("Error inicializando carrito:", error);
    }
  }

  private async waitForInit(): Promise<void> {
    if (this.isInitialized()) return;
    console.warn("Carrito no inicializado, esperando...");
    
    await new Promise(resolve =>
      setTimeout(resolve, 50)
    );

    return this.waitForInit();
  }

  // =============================
  // Agregar producto
  // =============================
  async addToCart(producto: CartItem) {
    await this.waitForInit();

    // CORRECCIÓN: Construcción explícita para evitar propiedades inesperadas
    const normalizado: CartItem = {
      _id: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      opcionesTipoTransaccion: producto.opcionesTipoTransaccion,
      // Normalización reforzada: asegura que 'imagenes' sea siempre un array de strings
      imagenes: Array.isArray(producto.imagenes)
        ? producto.imagenes
        : (typeof producto.imagenes === 'string' ? [producto.imagenes] : [])
    };

    const currentItems = this.itemsSignal();
    const exists = currentItems.some(item => item._id === normalizado._id);

    if (exists) {
      console.warn("Producto ya en carrito:", normalizado._id);
      return;
    }

    // Actualiza signal
    this.itemsSignal.set([...currentItems, normalizado]);

    try {
      console.log("Objeto final a guardar:", normalizado); // Log de depuración
      await this.indexedDbService.guardarProducto(normalizado);
      console.log("Guardado en IndexedDB:", normalizado);
    } catch (error) {
      console.error("Error al guardar, revirtiendo:", error);
      this.itemsSignal.set(currentItems);
    }
  }

  // =============================
  // Eliminar producto
  // =============================
  async removeFromCart(id: string) {
    const currentItems = this.itemsSignal();
    const updatedItems = currentItems.filter(item => item._id !== id);

    this.itemsSignal.set(updatedItems);

    try {
      await this.indexedDbService.eliminarProducto(id);
      console.log("Eliminado de IndexedDB:", id);
    } catch (error) {
      console.error("Error eliminando en IndexedDB:", error);
      this.itemsSignal.set(currentItems); // revertir
    }
  }

  // =============================
  // Sincronizar con backend
  // =============================
  async syncWithBackend(backendItems: CartItem[]) {
    const localItems = this.itemsSignal();

    const merged = [...backendItems];

    for (const localItem of localItems) {
      const existsInBackend = backendItems.some(b => b._id === localItem._id);
      if (!existsInBackend) {
        merged.push(localItem);
      }
    }

    this.itemsSignal.set(merged);
    console.log("Carrito sincronizado con backend:", merged);
  }
}