import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // Asegúrate de tener la URL de tu API en el environment
// import { Venta } from './models/venta';  // Asegúrate de tener el modelo de Venta
// import { Renta } from './models/renta';  // Asegúrate de tener el modelo de Renta

@Injectable({
  providedIn: 'root',
})
export class VentayrentaService {
  private apiUrl = `${environment.api}/proceso`; // Base URL del backend para rentas

  constructor(private http: HttpClient) {}

  // Métodos de Venta
  crearVenta(venta: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crearVenta`, venta);
  }

  obtenerVentas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/obtenerVentas`);
  }

  obtenerProductosCompradoByIdUser(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/proceso/comprasByidUser/${usuarioId}`
    );
  }

  // Obtener todas las rentas
  obtenerRentas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/obtenerRentas`);
  }
  // Crear una nueva renta
  crearRenta(renta: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crearRenta`, renta);
  }
  editarRenta(rentaId: string, rentaData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/editarRenta/${rentaId}`, rentaData);
  }
  // Cancelar una renta
  cancelarRenta(data: { rentaId: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancelarRenta`, data);
  }
  // Cancelar una renta
  cancelarVenta(data: { ventaId: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancelarVenta`, data);
  }
  // Eliminar una renta
  eliminarRenta(rentaId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/rentaId/${rentaId}`);
  }
  // Eliminar rentas
  eliminarRentasSeleccionadas(rentaIds: string[]): Observable<any> {
    return this.http.delete(`${this.apiUrl}/rentasSeleccionadas/`, {
      // Cambié el método a DELETE
      body: { rentaIds },
    });
  }
  eliminarVentasSeleccionadas(rentaIds: string[]): Observable<any> {
    return this.http.delete(`${this.apiUrl}/ventasSeleccionadas/`, {
      // Cambié el método a DELETE
      body: { rentaIds },
    });
  }

  // Listar rentas de un usuario específico
  listarRentasUsuario(usuarioId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/listarRentasUsuario/${usuarioId}`);
  }

  // Obtener productos rentados por un usuario
  obtenerProductosRentadosByIdUser(usuarioId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/rentasByidUser/${usuarioId}`);
  }
  detalleRentaById(rentaId: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/rentaByIdProducto/${rentaId}`);
  }
}
