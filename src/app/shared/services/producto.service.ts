import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/Producto.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  constructor(private http: HttpClient) {}

  crearProducto(producto: FormData): Observable<Producto> {
    return this.http.post<Producto>(`${environment.api}/producto/`, producto);
  }
  crearRenta(data: any): Observable<Producto> {
    return this.http.post<any>(`${environment.api}/rentaUser/`, data);
  }

  editarProducto(id: string, producto: FormData): Observable<Producto> {
    return this.http.put<Producto>(
      `${environment.api}/producto/editarProducto/${id}`,
      producto
    );
  }

  eliminarProducto(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.api}/producto/${id}`);
  }

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${environment.api}/producto/`);
  }
  obtenerAccesorios(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${environment.api}/accesorio/`);
  }
  obtenerProductosAccesorio(): Observable<any> {
    return this.http.get<any>(`${environment.api}/vestidos-accesorios/`);
  }
  obtenerDetalleProductoById(id: any): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${environment.api}/producto/byId/${id}`);
  }
  obtenerRecomendacionesPorAtributos(vestido:object): Observable<Producto[]> {
    return this.http.post<Producto[]>(`${environment.api}/vestido/recomendar`,vestido);
  }
  obtenerRangoFechasVestido(id: any): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${environment.api}/producto/rango-fechas-renta/${id}`);
  }
}
