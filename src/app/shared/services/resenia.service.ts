import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface Resenia {
  id: string;
  contenido: string;
  calificacion: number;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  usuarioId: string;
  fecha: Date;
  // Add other review properties as needed
}

@Injectable({
  providedIn: 'root'
})
export class ReseniaService {
  private apiUrl = `${environment.api}/resenia`; // Assuming base path is '/resenias'

  constructor(private http: HttpClient) { }

  // Basic CRUD Operations
  crearResenia(reseniaData: any): Observable<Resenia> {
    return this.http.post<Resenia>(`${this.apiUrl}/`, reseniaData);
  }

  obtenerTodasResenias(): Observable<Resenia[]> {
    return this.http.get<Resenia[]>(`${this.apiUrl}/`);
  }

  obtenerReseniaPorId(id: string): Observable<Resenia> {
    return this.http.get<Resenia>(`${this.apiUrl}/${id}`);
  }

  actualizarResenia(id: string, estado: string): Observable<any> {
    return this.http.put<Resenia[]>(`${this.apiUrl}/actualizar/${id}`, { estado });
  }

  eliminarResenia(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  eliminarReseniasSeleccionadas(ids: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/eliminar-seleccionadas`, { ids });
  }

  // Status Management
  aceptarResenia(id: string): Observable<Resenia> {
    return this.http.get<Resenia>(`${this.apiUrl}/aceptar/${id}`);
  }

  rechazarResenia(id: string): Observable<Resenia> {
    return this.http.get<Resenia>(`${this.apiUrl}/rechazar/${id}`);
  }

  // Filtered Lists
  obtenerReseniasAceptadas(): Observable<Resenia[]> {
    return this.http.get<Resenia[]>(`${this.apiUrl}/aprobadas`);
  }

  obtenerReseniasRechazadas(): Observable<Resenia[]> {
    return this.http.get<Resenia[]>(`${this.apiUrl}/rechazadas`);
  }

  // User-specific Reviews
  obtenerReseniasPorUsuario(usuarioId: string): Observable<Resenia[]> {
    return this.http.get<Resenia[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  obtenerReseniasAceptadasPorUsuario(usuarioId: string): Observable<Resenia[]> {
    return this.http.get<Resenia[]>(`${this.apiUrl}/usuario/${usuarioId}/aceptadas`);
  }

  obtenerReseniasRechazadasPorUsuario(usuarioId: string): Observable<Resenia[]> {
    return this.http.get<Resenia[]>(`${this.apiUrl}/usuario/${usuarioId}/rechazadas`);
  }
}
