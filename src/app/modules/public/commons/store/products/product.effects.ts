// products/product.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

// Servicios
import { ProductoService } from '../../../../../shared/services/producto.service';
import { IndexedDbService } from '../../services/indexed-db.service';

// Acciones
import * as ProductActions from './product.actions';

// Tiempo de vida del caché (ej: 5 minutos)
const CACHE_DURATION_MS = 300000;

@Injectable()
export class ProductEffects {

  constructor(
    private actions$: Actions,
    private apiService: ProductoService,
    private indexedDbService: IndexedDbService
  ) {}

  loadProductos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProductos),
      // Usamos switchMap para manejar la lógica asíncrona
      switchMap(async () => {
        const currentTime = new Date().getTime();

        try {
          // 1. INTENTAR CARGAR DESDE INDEXEDDB
          const cachedData: { data: any[], timestamp: number } | null = 
            await this.indexedDbService.obtenerProductos(); // Asumiendo que devuelve { data, timestamp }
          
          const isCacheValid = cachedData && (currentTime - cachedData.timestamp) < CACHE_DURATION_MS;

          if (isCacheValid && cachedData!.data.length > 0) {
            console.log(' Effect: Usando caché válido de IndexedDB.');
            // Si el caché es válido, retorna la acción de éxito INMEDIATAMENTE.
            return ProductActions.loadProductosSuccess({ productos: cachedData!.data });
          }

          // 2. CACHÉ INVÁLIDO O VACÍO: Llamar a la API
          console.log(' Effect: Cache inválido o vacío. Llamando a la API...');
          
          return this.apiService.obtenerProductos().pipe(
            // 3. ÉXITO DE API: Guardar en IndexedDB y retornar éxito
            tap(async (productos) => {
              const dataToStore = { data: productos, timestamp: new Date().getTime() };
              await this.indexedDbService.guardarProductos(dataToStore);
              console.log('💾 Effect: Datos de API guardados en IndexedDB.');
            }),
            map(productos => ProductActions.loadProductosSuccess({ productos })),
            
            // 4. FALLO DE API: Intentar usar caché obsoleto
            catchError(apiError => {
              console.error(' Effect: Fallo de API.', apiError);
              
              if (cachedData && cachedData.data.length > 0) {
                console.log('⚠️ Effect: Usando caché obsoleto como fallback.');
                // Si la API falla, pero tenemos datos obsoletos, los usamos.
                return of(ProductActions.loadProductosSuccess({ productos: cachedData.data }));
              }
              
              // Si todo falla, despachamos el fallo.
              return of(ProductActions.loadProductosFailure({ error: apiError }));
            })
          );
        } catch (dbError) {
          console.error(' Effect: Error en IndexedDB, forzando llamada a API.', dbError);
          // Si IndexedDB falla, procedemos a llamar directamente a la API (o despachar fallo)
          return this.apiService.obtenerProductos().pipe(
            map(productos => ProductActions.loadProductosSuccess({ productos })),
            catchError(apiError => of(ProductActions.loadProductosFailure({ error: apiError })))
          );
        }
      }),
      // El effect debe retornar un Observable de una Action, por eso usamos `switchMap` 
      // y `of` en los casos asíncronos que no son Observable.
      switchMap(result => (result instanceof Array) ? result : of(result))
    )
  );
}