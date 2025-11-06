// products/product.reducers.ts
import { createReducer, on, State } from '@ngrx/store';
import * as ProductActions from './product.actions';

// 1. Define la forma del estado
export interface ProductState {
  data: any[];       // La lista de productos
  loading: boolean;  // Indicador de carga
  error: any;        // Manejo de errores
}

// 2. Estado inicial
export const initialProductState: ProductState = {
  data: [],
  loading: false,
  error: null,
};

// 3. Define la función reductora
export const productReducers = createReducer(
  initialProductState,

  // Cuando se inicia la carga, mostramos el spinner
  on(ProductActions.loadProductos, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  // Cuando los datos llegan con éxito, guardamos los productos y ocultamos el spinner
  on(ProductActions.loadProductosSuccess, (state, { productos }) => ({
    ...state,
    data: productos,
    loading: false,
    error: null,
  })),

  // Si hay un error, lo guardamos y ocultamos el spinner
  on(ProductActions.loadProductosFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  }))
);