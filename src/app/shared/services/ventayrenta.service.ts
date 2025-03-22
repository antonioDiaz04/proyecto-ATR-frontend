import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseHttpService } from './base-http.service';

@Injectable({
  providedIn: 'root',
})
export class VentayrentaService extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http);
  }

  // Métodos de Venta
  crearVenta(venta: FormData): Observable<any> {
    return this.post<any>(`${environment.api}/proceso/crearVenta`, venta);
  }

  obtenerVentas(): Observable<any[]> {
    return this.get<any[]>(`${environment.api}/proceso/obtenerVentas`);
  }

  obtenerProductosCompradoByIdUser(usuarioId: string): Observable<any[]> {
    return this.get<any[]>(
      `${environment.api}/proceso/comprasByidUser/${usuarioId}`
    );
  }

  // Métodos de Renta
  crearRenta(renta: FormData): Observable<any> {
    return this.post<any>(`${environment.api}/proceso/crearRenta`, renta);
  }

  obtenerRentas(): Observable<any[]> {
    return this.get<any[]>(`${environment.api}/proceso/obtenerRentas`);
  }

  obtenerProductosRentadosByIdUser(usuarioId: string): Observable<any[]> {
    return this.get<any[]>(
      `${environment.api}/proceso/rentasByidUser/${usuarioId}`
    );
  }
}
