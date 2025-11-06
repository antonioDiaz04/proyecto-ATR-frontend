// products/product.actions.ts
import { createAction, props } from '@ngrx/store';

export const loadProductos = createAction(
  '[Productos Page] Load Productos'
);

export const loadProductosSuccess = createAction(
  '[Productos API] Load Productos Success',
  props<{ productos: any[] }>()
);

export const loadProductosFailure = createAction(
  '[Productos API] Load Productos Failure',
  props<{ error: any }>()
);