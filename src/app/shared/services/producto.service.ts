import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/Producto.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  // private apiUrl = 'http://localhost:3000/api/productos'; // Ajusta la URL según tu configuración

  constructor(private http: HttpClient) { }

  crearProducto(producto:FormData): Observable<Producto> {
    // const fd = new FormData();
  //  fd.append('title', title);
    // fd.append('description', description);
    // fd.append('image', photo);
    // fd.append('image', producto);
    return this.http.post<Producto>(`${environment.api}/productos/`,producto);
  }
  crearRenta(data:any): Observable<Producto> {
   
    return this.http.post<any>(`${environment.api}/rentaUser/`,data);
  }

  editarProducto(id: string, producto:FormData): Observable<Producto> {
    return this.http.put<Producto>(`${environment.api}/producto/editarProducto/${id}`, producto);
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
  obtenerDetalleProductoById(id:any): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${environment.api}/producto/byId/${id}`);
  }
}
