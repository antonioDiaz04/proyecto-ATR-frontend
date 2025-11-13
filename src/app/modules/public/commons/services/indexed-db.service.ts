import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private db: IDBDatabase | null = null;
  private productosSubject = new BehaviorSubject<any[]>([]);
  productos$ = this.productosSubject.asObservable();
  private readonly DB_NAME = 'Atelierdb';
  private readonly DB_VERSION = 3; // Incrementada para forzar actualización
  private indexedDBSupported: boolean;

  constructor() {
    this.indexedDBSupported = this.checkIndexedDBSupport();
    if (this.indexedDBSupported) {
      this.initializeDB();
    } else {
      console.warn('IndexedDB no está soportado en este navegador');
    }
  }

  private checkIndexedDBSupport(): boolean {
    try {
      return !!window.indexedDB;
    } catch (e) {
      console.error('Error al verificar IndexedDB:', e);
      return false;
    }
  }

  private initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // ✅ Crear Object Stores si no existen
        if (!db.objectStoreNames.contains('productosOffline')) {
          const store = db.createObjectStore('productosOffline', { keyPath: '_id' });
          store.createIndex('categoria', 'categoria', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('apartados')) {
          db.createObjectStore('apartados', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('suscripciones')) {
          db.createObjectStore('suscripciones', { keyPath: 'key' });
        }
        
        console.log('✅ Object Stores creados/actualizados');
      };

      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('✅ Conexión a IndexedDB establecida correctamente');
        resolve();
      };

      request.onerror = (event: Event) => {
        console.error('❌ Error al abrir IndexedDB:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  // ✅ Esperar a que la BD esté lista
  private async ensureDBReady(): Promise<boolean> {
    if (!this.indexedDBSupported) return false;

    if (!this.db) {
      try {
        await this.initializeDB();
      } catch (error) {
        console.error('Error al inicializar DB:', error);
        return false;
      }
    }
    return true;
  }

  // ✅ GUARDAR PRODUCTOS PARA OFFLINE (MEJORADO)
  async guardarProductosOffline(productos: any[]): Promise<void> {
    if (!(await this.ensureDBReady())) {
      throw new Error('IndexedDB no disponible');
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['productosOffline'], 'readwrite');
        const store = transaction.objectStore('productosOffline');
        
        // Limpiar store existente primero
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
          console.log(`🔄 Guardando ${productos.length} productos en cache...`);
          
          let completed = 0;
          let errors = 0;
          
          if (productos.length === 0) {
            resolve();
            return;
          }
          
          productos.forEach(producto => {
            // Asegurar que el producto tenga _id
            if (!producto._id) {
              producto._id = `temp_${Date.now()}_${Math.random()}`;
            }
            
            const request = store.put(producto);
            
            request.onsuccess = () => {
              completed++;
              if (completed + errors === productos.length) {
                console.log(`✅ ${completed} productos guardados en cache`);
                resolve();
              }
            };
            
            request.onerror = () => {
              errors++;
              console.error('Error guardando producto:', producto._id);
              if (completed + errors === productos.length) {
                if (errors > 0) {
                  reject(new Error(`${errors} productos no se pudieron guardar`));
                } else {
                  resolve();
                }
              }
            };
          });
        };
        
        clearRequest.onerror = () => {
          reject(clearRequest.error);
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }

  // ✅ OBTENER PRODUCTOS OFFLINE (MEJORADO)
  async obtenerProductosOffline(): Promise<any[]> {
    if (!(await this.ensureDBReady())) {
      console.warn('IndexedDB no disponible');
      return [];
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['productosOffline'], 'readonly');
        const store = transaction.objectStore('productosOffline');
        const request = store.getAll();
        
        request.onsuccess = () => {
          console.log(`📥 Recuperados ${request.result.length} productos desde cache`);
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('Error obteniendo productos offline:', request.error);
          reject(request.error);
        };
        
      } catch (error) {
        console.error('Error en transacción:', error);
        reject(error);
      }
    });
  }

  // ✅ MÉTODOS PARA APARTADOS (existente)
  async guardarProducto(producto: any): Promise<void> {
    if (!(await this.ensureDBReady())) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apartados'], 'readwrite');
      const store = transaction.objectStore('apartados');
      const request = store.put(producto);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async eliminarProducto(id: string): Promise<void> {
    if (!(await this.ensureDBReady())) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apartados'], 'readwrite');
      const store = transaction.objectStore('apartados');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async obtenerProductosApartados(): Promise<any[]> {
    if (!(await this.ensureDBReady())) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apartados'], 'readonly');
      const store = transaction.objectStore('apartados');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ✅ MÉTODOS PARA SUSCRIPCIONES (existente)
  async guardarSuscripcion(subscription: PushSubscription): Promise<void> {
    if (!(await this.ensureDBReady())) return;

    const subJSON = subscription.toJSON();
    (subJSON as any).key = 'actual';
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['suscripciones'], 'readwrite');
      const store = transaction.objectStore('suscripciones');
      const request = store.put(subJSON);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ✅ NUEVO: Limpiar cache de productos
  async limpiarProductosOffline(): Promise<void> {
    if (!(await this.ensureDBReady())) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['productosOffline'], 'readwrite');
      const store = transaction.objectStore('productosOffline');
      const request = store.clear();
      
      request.onsuccess = () => {
        console.log('✅ Cache de productos limpiado');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ✅ NUEVO: Verificar si hay datos offline
  async tieneDatosOffline(): Promise<boolean> {
    if (!(await this.ensureDBReady())) return false;

    const productos = await this.obtenerProductosOffline();
    return productos.length > 0;
  }
}