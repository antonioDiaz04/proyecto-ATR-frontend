import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PropietarioService {
  private readonly apiUrl = `${environment.api}/estadisticas`;

  constructor(private http: HttpClient) {}
  getTotalesRentaVentaPorRango(start: string, end: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/obtenerTotalesRentaVenta?start=${start}&end=${end}`);
  }
}
