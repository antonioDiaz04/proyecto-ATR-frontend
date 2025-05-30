import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = environment.api

  constructor(private http: HttpClient) {}

  crearCategoria(categoria: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categorias/`, categoria);
  }

  obtenerCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categorias/`);
  }

  obtenerCategoriaPorId(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/categorias/${id}`);
  }

  actualizarCategoria(id: string, categoria: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/categorias/${id}`, categoria);
  }

  eliminarCategoria(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categorias/${id}`);
  }
}