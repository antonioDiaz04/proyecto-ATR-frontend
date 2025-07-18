import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ControlAdministrativaService {
  constructor(private http: HttpClient) {}

  //* ==================================================
  //* 🔒 POLÍTICAS
  //* ==================================================

  registerPolitica(politica: any): Observable<any> {
    return this.http.post(environment.api + '/admin/crearPoliticas', politica);
  }

  obtenerPoliticas(): Observable<any> {
    return this.http.get(environment.api + '/admin/obtenerPoliticas');
  }

  obtenerHistorialPoliticas(id: any): Observable<any> {
    return this.http.get(
      environment.api + '/admin/obtenerHistorialPoliticas/' + id
    );
  }

  actualizarPoliticas(id: any, nuevaPolitica: any): Observable<any> {
    return this.http.put(
      environment.api + '/admin/actualizarPoliticas/' + id,
      nuevaPolitica
    );
  }

  eliminarPolitica(id: string): Observable<any> {
    return this.http.delete(`${environment.api}/admin/eliminarPolitica/${id}`);
  }

  //* ==================================================
  //* 🔒 TÉRMINOS Y CONDICIONES
  //* ==================================================

  registerTerminosYCondiciones(terminosYCondiciones: any): Observable<any> {
    return this.http.post(
      environment.api + '/admin/crearTerminosYCondiciones',
      terminosYCondiciones
    );
  }

  obtenerTerminosYCondiciones(): Observable<any> {
    return this.http.get(
      environment.api + '/admin/obtenerTerminosYCondiciones'
    );
  }

  obtenerHistorialTerminosYCondiciones(id: any): Observable<any> {
    return this.http.get(
      environment.api + '/admin/obtenerHistorialTerminosYCondiciones/' + id
    );
  }

  actualizarTerminosYCondiciones(id: any, nuevoTerminos: any): Observable<any> {
    return this.http.put(
      environment.api + '/admin/actualizarTerminosYCondiciones/' + id,
      nuevoTerminos
    );
  }

  eliminarTerminosYCondiciones(id: string): Observable<any> {
    return this.http.delete(
      `${environment.api}/admin/eliminarTerminosYCondiciones/${id}`
    );
  }

  //* ==================================================
  //* 🔒 DESLINDE LEGAL
  //* ==================================================

  registerDeslindeLegal(nuevoDeslindeLegal: any): Observable<any> {
    return this.http.post(
      environment.api + '/admin/crearDeslindeLegal',
      nuevoDeslindeLegal
    );
  }

  obtenerDeslindeLegal(): Observable<any> {
    return this.http.get(environment.api + '/admin/obtenerDeslindesLegales');
  }

  obtenerHistorialDeslindeLegal(id: any): Observable<any> {
    return this.http.get(
      environment.api + '/admin/obtenerTerminosYCondicionesVigentes/' + id
    );
  }

  actualizarDeslindeLegal(id: any, nuevoDeslindeLegal: any): Observable<any> {
    return this.http.put(
      environment.api + '/admin/actualizarDeslindeLegal/' + id,
      nuevoDeslindeLegal
    );
  }

  eliminarDeslindeLegal(id: string): Observable<any> {
    return this.http.delete(
      `${environment.api}/admin/eliminarDeslindeLegal/${id}`
    );
  }

  //* ==================================================
  //* 🔒 MISIÓN
  //* ==================================================

  crearMision(mision: any): Observable<any> {
    return this.http.post(environment.api + '/quienesSomos/mision', mision);
  }

  obtenerMisiones(): Observable<any> {
    return this.http.get(environment.api + '/quienesSomos/mision');
  }

  actualizarMision(id: string, mision: any): Observable<any> {
    return this.http.put(
      `${environment.api}/quienesSomos/mision/${id}`,
      mision
    );
  }

  eliminarMision(id: string): Observable<any> {
    return this.http.delete(`${environment.api}/quienesSomos/mision/${id}`);
  }

  //* ==================================================
  //* 🔒 VISIÓN
  //* ==================================================

  crearVision(vision: any): Observable<any> {
    return this.http.post(environment.api + '/quienesSomos/vision', vision);
  }

  obtenerVision(): Observable<any> {
    return this.http.get(environment.api + '/quienesSomos/vision');
  }


  eliminarVision(id: string): Observable<any> {
    return this.http.delete(`${environment.api}/quienesSomos/vision/${id}`);
  }

  //* ==================================================
  //* 🔒 VALORES
  //* ==================================================

  crearValor(valor: any): Observable<any> {
    return this.http.post(environment.api + '/quienesSomos/valores', valor);
  }

  obtenerValores(): Observable<any> {
    return this.http.get(environment.api + '/quienesSomos/valores');
  }

  obtenerTodosLosValores(): Observable<any> {
    return this.http.get(environment.api + '/quienesSomos/valores/all');
  }

  actualizarValor(id: string, valor: any): Observable<any> {
    return this.http.put(
      `${environment.api}/quienesSomos/valores/${id}`,
      valor
    );
  }

  eliminarValor(id: string): Observable<any> {
    return this.http.delete(`${environment.api}/admin/valores/${id}`);
  }

  //* ==================================================
  //* 🔒 PREGUNTAS FRECUENTES
  //* ==================================================

  obtenerPreguntas(): Observable<any> {
    return this.http.get(
      environment.api + '/quienesSomos/preguntas-frecuentes'
    );
  }

  obtenerTodasLasPreguntas(): Observable<any> {
    return this.http.get(
      environment.api + '/quienesSomos/preguntas-frecuentes/all'
    );
  }

  createPregunta(data: any) {
    return this.http.post('/api/preguntas', data);
  }

  updatePregunta(id: string, data: any) {
    return this.http.put(`/api/preguntas/${id}`, data);
  }

  eliminarPregunta(id: string): Observable<any> {
    return this.http.delete(
      `${environment.api}/quienesSomos/preguntas-frecuentes/${id}`
    );
  }
}
