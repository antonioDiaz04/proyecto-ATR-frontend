import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';

@Injectable({
  providedIn: 'root',
})
export class DatosEmpresaService extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http);
  }

  editarPerfilEmpresa(data: any): Observable<any> {
    const url = `${environment.api}/Empresa/editarPerfilEmpresa/`;
    return this.put(url, data);
  }
  configurarEmpresa(data: any): Observable<any> {
    const url = `${environment.api}/Empresa/editarConfigurarEmpresa/`;
    return this.put(url, data);
  }

  traerDatosEmpresa(): Observable<any> {
    const url = `${environment.api}/Empresa/obtenerPerfilesEmpresa`;
    return this.get(url);
  }
  getPoliticas(): Observable<any> {
    const url = `${environment.api}/politicas/`;
    return this.get(url);
  }
  getTerminos(): Observable<any> {
    const url = `${environment.api}/admin/obtenerTerminosYCondicionesVigentes`;
    return this.get(url);
  }

  //redes sociales
  guardarRedSocial(id: any, redSocial: any): Observable<any> {
    const url = `${environment.api}/Empresa/guardarRedSocial/` + id;
    return this.post(url, redSocial);
  }
  //redes sociales
  obtenerRedesSociales(): Observable<any> {
    const url = `${environment.api}/Empresa/obtenerRedesSociales`;
    return this.get(url);
  }

  eliminarRedSocial(id: any): Observable<any> {
    const url = `${environment.api}/Empresa/eliminarRedSocial/` + id;
    return this.delete(url);
  }
}
