import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseHttpService } from './base-http.service';

@Injectable({
  providedIn: 'root',
})
export class ClientesService extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http);
  }

  obtenerPurificadoras(): Observable<any> {
    return this.get(`${environment.api}/adminPage/purificadoras`);
  }
  obtenerColoniasYclientes(): Observable<any> {
    return this.get(`${environment.api}/usuarios/clientes/agrupados`);
  }

  // http://localhost:4000/usuarios/getUsuarios
  obtenerCLientes(): Observable<any> {
    return this.get(`${environment.api}/usuarios/`);
  }

  // obtenerCLientesByIdPurificadora(idPurificadora: any): Observable<any> {
  //   return this.http.get(
  //     `${environment.api}/purificadoraAdmin/clientes/`+idPurificadora
  //   );
  // }
  // obtenerCLientesDisponibles(): Observable<any> {
  //   return this.http.get(
  //     `${environment.api}/purificadoraAdmin/clientesDisponibles/`
  //   );
  // }
  // obtenerCLientesDisponiblesByColonia(colonia: any): Observable<any> {
  //   const url = `${environment.api}/purificadoraAdmin/clientesDisponiblesByColonia/`;
  //   return this.http.post(url, { colonia });
  // }

  detalleClienteById(id: string): Observable<any> {
    const url = `${environment.api}/usuarios/` + id;
    return this.get(url);
  }
  purificadora(id: string): Observable<any> {
    const url = `${environment.api}/purificadoraAdmin/purificadora/` + id;
    return this.get(url);
  }

  updateUsuario(id: string, cliente: any): Observable<any> {
    const url = `${environment.api}/usuarios/actualiza/` + id;
    return this.put(url, cliente);
  }

  eliminarPurificadora(id: string): Observable<any> {
    const url = `${environment.api}/purificadoraAdmin/deletePurificadora/` + id;
    return this.delete(url);
  }

  eliminarCliente(id: string): Observable<any> {
    const url = `${environment.api}/usuarios/deleteCliente/` + id;
    return this.delete(url);
  }
}
