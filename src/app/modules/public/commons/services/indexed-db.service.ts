import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private db: IDBDatabase | null = null;
  private productosSubject = new BehaviorSubject<any[]>([]);
  productos$ = this.productosSubject.asObservable();
  private indexedDBSupported: boolean;

  constructor() {
    // Verificar si IndexedDB está soportado en el navegador
    this.indexedDBSupported = this.checkIndexedDBSupport();

    if (this.indexedDBSupported) {
      this.initializeDB();
    } else {
      console.warn('IndexedDB no está soportado en este navegador');
    }
  }

  // Método para verificar soporte de IndexedDB
  private checkIndexedDBSupport(): boolean {
    try {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB no está disponible en window');
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error al verificar IndexedDB:');
      return false;
    }
  }

  // Inicializar la base de datos
  // private async initializeDB() {
  //   if (!this.indexedDBSupported) {
  //     console.warn('No se puede inicializar IndexedDB: no soportado');
  //     return;
  //   }

  //   try {
  //     const request = indexedDB.open('Atelierdb', 1);

  //     request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
  //       const db = (event.target as IDBOpenDBRequest).result;
  //       if (!db.objectStoreNames.contains('apartados')) {
  //         db.createObjectStore('apartados', { keyPath: 'id' });
  //       }
  //       if (!db.objectStoreNames.contains('suscripciones')) {
  //         db.createObjectStore('suscripciones', { keyPath: 'key' });
  //       }
  //     };

  //     request.onsuccess = (event: Event) => {
  //       this.db = (event.target as IDBOpenDBRequest).result;
  //       console.log('Conexión a IndexedDB establecida correctamente');
  //       this.actualizarProductos();
  //     };

  //     request.onerror = () => {
  //       console.error("Error al abrir la base de datos:");
  //     };
  //   } catch (error) {
  //     console.error('Error al inicializar IndexedDB:');
  //   }
  // }
   private initializeDB() {
    // Usa versión 2 para forzar onupgradeneeded si ya existe la DB
    const request = indexedDB.open('Atelierdb', 2);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // ✅ CREAR Object Store para productos offline
      if (!db.objectStoreNames.contains('productosOffline')) {
        db.createObjectStore('productosOffline', { keyPath: '_id' });
      }
      
      // Object store para productos apartados
      if (!db.objectStoreNames.contains('apartados')) {
        db.createObjectStore('apartados', { keyPath: 'id' });
      }
      
      // Object store para suscripciones
      if (!db.objectStoreNames.contains('suscripciones')) {
        db.createObjectStore('suscripciones', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event: Event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      console.log('✅ IndexedDB inicializada');
    };

    request.onerror = () => {
      console.error('❌ Error al abrir IndexedDB');
    };
  }


 
  // ✅ Guardar TODOS los productos para offline
  async guardarProductosOffline(productos: any[]): Promise<void> {
    if (!this.db) {
      console.warn('IndexedDB no inicializada');
      return;
    }

    const transaction = this.db.transaction('productosOffline', 'readwrite');
    const store = transaction.objectStore('productosOffline');
    
    await store.clear(); // Limpiar datos antiguos
    
    for (const producto of productos) {
      store.put(producto);
    }
    
    console.log(`✅ ${productos.length} productos cacheados`);
  }
 // ✅ Obtener productos para mostrar (offline)
  async obtenerProductosOffline(): Promise<any[]> {
    if (!this.db) {
      console.warn('IndexedDB no inicializada');
      return [];
    }

    const transaction = this.db.transaction('productosOffline', 'readonly');
    const store = transaction.objectStore('productosOffline');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }



  
  // Método para verificar si la base de datos está lista
  private async ensureDBReady(): Promise<boolean> {
    if (!this.indexedDBSupported) return false;

    if (!this.db) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.db !== null;
    }
    return true;
  }

  // Actualizar la lista de productos
  private async actualizarProductos() {
    try {
      const productos = await this.obtenerProductosApartados();
      this.productosSubject.next(productos);
    } catch (error) {
      console.error('Error al actualizar productos:');
    }
  }

  // Guardar un producto
  async guardarProducto(producto: any) {
    if (!this.indexedDBSupported) {
      console.warn('No se puede guardar: IndexedDB no soportado');
      return;
    }

    if (!await this.ensureDBReady()) {
      console.error('No se pudo inicializar la base de datos');
      return;
    }

    try {
      const transaction = this.db!.transaction('apartados', 'readwrite');
      const store = transaction.objectStore('apartados');
      store.put(producto);
      await this.actualizarProductos();
    } catch (error) {
      console.error('Error al guardar producto:');
    }
  }

  // Eliminar un producto
  async eliminarProducto(id: string) {
    if (!this.indexedDBSupported) return;

    if (!await this.ensureDBReady()) {
      console.error('No se pudo inicializar la base de datos');
      return;
    }

    try {
      const transaction = this.db!.transaction('apartados', 'readwrite');
      const store = transaction.objectStore('apartados');
      store.delete(id);
      await this.actualizarProductos();
    } catch (error) {
      console.error('Error al eliminar producto');
    }
  }

  // Obtener todos los productos
  async obtenerProductosApartados(): Promise<any[]> {
    if (!this.indexedDBSupported) {
      console.warn('IndexedDB no soportado, retornando array vacío');
      return [];
    }

    if (!await this.ensureDBReady()) {
      console.error('No se pudo inicializar la base de datos');
      return [];
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction('apartados', 'readonly');
        const store = transaction.objectStore('apartados');
        const request = store.getAll();

        request.onsuccess = () => {
          console.log('Productos obtenidos de IndexedDB:', request.result);
          resolve(request.result);
        };

        request.onerror = () => {
          console.error('Error al obtener productos');
          reject(request.error);
        };
      } catch (error) {
        console.error('Error en la transacción');
        reject(error);
      }
    });
  }



  // indexed-db.service.ts
  async guardarSuscripcion(subscription: PushSubscription): Promise<void> {
    if (!this.indexedDBSupported) {
      console.warn('IndexedDB no soportado');
      return;
    }
    if (!await this.ensureDBReady()) {
      console.error('No se pudo inicializar la base de datos');
      return;
    }
    const subJSON = subscription.toJSON();
    // Add a key property for the object store with keyPath 'key'
    (subJSON as any).key = 'actual';
    const transaction = this.db!.transaction('suscripciones', 'readwrite');
    const store = transaction.objectStore('suscripciones');
    await new Promise<void>((resolve, reject) => {
      const request = store.put(subJSON);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

}