import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PropietarioService {
  private readonly apiUrl = `${environment.api}/estadisticas/resumen`;

  constructor(private http: HttpClient) {}

  getResumenVentas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ventas`);
  }

  getResumenRentas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/rentas`);
  }

  getClientesUnicos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/clientes`);
  }

  getProductosMasVendidos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/productos-mas-vendidos`);
  }

  getDatosGraficas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/graficas`);
  }
}
