import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private db: IDBDatabase | null = null;
  private productosSubject = new BehaviorSubject<any[]>([]); // Emite cambios en los productos
  productos$ = this.productosSubject.asObservable(); // Observable para suscribirse

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeDB();
    } else {
      console.warn('IndexedDB no está disponible en el servidor.');
    }
  }

  // Inicializar la base de datos
  private async initializeDB() {
    if (
      !isPlatformBrowser(this.platformId) ||
      typeof indexedDB === 'undefined'
    ) {
      console.warn('IndexedDB no está disponible.');
      return;
    }
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB no está disponible.');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('Atelierdb', 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('apartados')) {
          db.createObjectStore('apartados', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.actualizarProductos().catch((error) => {
          console.error('Error al actualizar productos:', error);
        });
      };

      request.onerror = () => {
        console.warn('Error al abrir la base de datos.');
      };
    });
  }
  // Actualizar la lista de productos y notificar a los suscriptores
  private async actualizarProductos() {
    try {
      const productos = await this.obtenerProductosApartados();
      this.productosSubject.next(productos); // Emitir la nueva lista de productos
    } catch (error) {
      console.warn(
        'Error en actualizarProductos:',
        this.getErrorMessage(error)
      );
    }
  }

  // Guardar un producto en IndexedDB
  async guardarProducto(producto: any) {
    try {
      if (!this.db) await this.initializeDB();
      if (!this.db) throw new Error('La base de datos no está disponible.');

      const transaction = this.db.transaction('apartados', 'readwrite');
      const store = transaction.objectStore('apartados');
      const request = store.put(producto);

      await this.handleRequest(request);

      await this.actualizarProductos(); // Actualizar y notificar
    } catch (error) {
      console.warn('Error en guardarProducto:', this.getErrorMessage(error));
    }
  }

  // Eliminar un producto de IndexedDB
  async eliminarProducto(id: string) {
    try {
      if (!this.db) await this.initializeDB();
      if (!this.db) throw new Error('La base de datos no está disponible.');

      const transaction = this.db.transaction('apartados', 'readwrite');
      const store = transaction.objectStore('apartados');
      const request = store.delete(id);

      await this.handleRequest(request);

      await this.actualizarProductos(); // Actualizar y notificar
    } catch (error) {
      console.warn('Error en eliminarProducto:', this.getErrorMessage(error));
    }
  }

  // Obtener todos los productos de IndexedDB
  async obtenerProductosApartados(): Promise<any[]> {
    try {
      if (!this.db) await this.initializeDB();
      if (!this.db) throw new Error('La base de datos no está disponible.');

      const transaction = this.db!.transaction('apartados', 'readonly');
      const store = transaction.objectStore('apartados');
      const request = store.getAll();

      return await this.handleRequest(request);
    } catch (error) {
      console.warn(
        'Error en obtenerProductosApartados:',
        this.getErrorMessage(error)
      );
      return [];
    }
  }

  // Función auxiliar para manejar peticiones a IndexedDB
  private async handleRequest<T>(request: IDBRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  // Función auxiliar para obtener solo el mensaje del error
  private getErrorMessage(error: any): string {
    return error instanceof Error ? error.message : 'Error desconocido';
  }
}
