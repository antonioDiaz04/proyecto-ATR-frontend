import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatosEmpresaService {
  constructor(private http: HttpClient) {}

  editarPerfilEmpresa(data: any): Observable<any> {
    const url = `${environment.api}/Empresa/editarPerfilEmpresa/`;
    return this.http.put(url, data);
  }
  configurarEmpresa(data: any): Observable<any> {
    const url = `${environment.api}/Empresa/editarConfigurarEmpresa/`;
    return this.http.put(url, data);
  }

  traerDatosEmpresa(): Observable<any> {
    const url = `${environment.api}/Empresa/obtenerPerfilesEmpresa`;
    return this.http.get(url);
  }
  getPoliticas(): Observable<any> {
    const url = `${environment.api}/politicas/`;
    return this.http.get(url);
  }
  getTerminos(): Observable<any> {
    const url = `${environment.api}/admin/obtenerTerminosYCondicionesVigentes`;
    return this.http.get(url);
  }
  //redes sociales
  guardarRedSocial(id: any, redSocial: any): Observable<any> {
    const url = `${environment.api}/Empresa/guardarRedSocial/` + id;
    return this.http.post(url, redSocial);
  }
  //redes sociales
  obtenerRedesSociales(): Observable<any> {
    const url = `${environment.api}/Empresa/obtenerRedesSociales` ;
    return this.http.get(url);
  }

  eliminarRedSocial(id: any): Observable<any> {
    const url = `${environment.api}/Empresa/eliminarRedSocial/` + id;
    return this.http.delete(url);
  }
}
