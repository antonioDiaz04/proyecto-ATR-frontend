import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/Producto.model';
import { environment } from '../../../environments/environment';
import { BaseHttpService } from './base-http.service';

@Injectable({
  providedIn: 'root',
})
export class ProductoService extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http);
  }

  crearProducto(producto: FormData): Observable<Producto> {
    return this.post<Producto>(`${environment.api}/producto/`, producto);
  }
  crearRenta(data: any): Observable<Producto> {
    return this.post<any>(`${environment.api}/rentaUser/`, data);
  }

  editarProducto(id: string, producto: FormData): Observable<Producto> {
    return this.put<Producto>(
      `${environment.api}/producto/editarProducto/${id}`,
      producto
    );
  }

  eliminarProducto(id: string): Observable<void> {
    return this.delete<void>(`${environment.api}/producto/${id}`);
  }

  obtenerProductos(): Observable<Producto[]> {
    return this.get<Producto[]>(`${environment.api}/producto/`);
  }
  obtenerAccesorios(): Observable<Producto[]> {
    return this.get<Producto[]>(`${environment.api}/accesorio/`);
  }
  obtenerProductosAccesorio(): Observable<any> {
    return this.get<any>(`${environment.api}/vestidos-accesorios/`);
  }
  obtenerDetalleProductoById(id: any): Observable<Producto[]> {
    return this.get<Producto[]>(`${environment.api}/producto/byId/${id}`);
  }
}
