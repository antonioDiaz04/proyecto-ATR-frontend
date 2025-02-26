import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';  // Asegúrate de tener la URL de tu API en el environment
// import { Venta } from './models/venta';  // Asegúrate de tener el modelo de Venta
// import { Renta } from './models/renta';  // Asegúrate de tener el modelo de Renta

@Injectable({
  providedIn: 'root'
})
export class VentayrentaService {

  constructor(private http: HttpClient) { }

  // Métodos de Venta
  crearVenta(venta: FormData): Observable<any> {
    return this.http.post<any>(`${environment.api}/proceso/crearVenta`, venta);
  }

  obtenerVentas(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.api}/proceso/obtenerVentas`);
  }

  obtenerProductosCompradoByIdUser(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.api}/proceso/comprasByidUser/${usuarioId}`);
  }

  // Métodos de Renta
  crearRenta(renta: FormData): Observable<any> {
    return this.http.post<any>(`${environment.api}/proceso/crearRenta`, renta);
  }

  obtenerRentas(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.api}/proceso/obtenerRentas`);
  }

  obtenerProductosRentadosByIdUser(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.api}/proceso/rentasByidUser/${usuarioId}`);
  }
}
