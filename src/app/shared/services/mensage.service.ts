import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BaseHttpService } from './base-http.service';

// interface MessageBody {
//   subject: string;
//   content: string;
// }
@Injectable()
export class mensageservice extends BaseHttpService {
  // url = '/correo/token/';
  url = 'https://servidortropicalworld-1.onrender.com/correo/token/';
  constructor(http: HttpClient) {
    super(http);
  }

  enviarTokenCorreo(email: string): Observable<any> {
    return this.post<any>(`${environment.api}/enviar-correo`, { email });
    // return this._http.post<any>(this.url, { correo });
  }
  enviarTokenSMS(number_to_send: string): Observable<any> {
    return this.post<any>(`${environment.api}/enviar-number`, {
      number_to_send,
    });
    // return this._http.post<any>(this.url, { correo });
  }
  enviarTokenWasthapp(number_to_send: string): Observable<any> {
    return this.post<any>(`${environment.api}/msj/enviar-mensaje`, {
      number_to_send,
    });
    // return this._http.post<any>(this.url, { correo });
  }
  activarCuenta(email: string, codigoVerificacion: string): Observable<any> {
    return this.post<any>(`${environment.api}/verificacion/activar-cuenta`, {
      email,
      codigoVerificacion,
    });
  }
  // verificarCodigo(email: string, codigo: string): Observable<any> {
  //   return this._http.post<any>(`${environment.api}/verificacion/activar-cuenta`, { email, codigo });
  // }

  enviarNotificacion(): Observable<any> {
    return this.post<any>(
      `${environment.api}/enviar-notificacion/revisar-correo`,
      {}
    );
  }

  // enviarNotificacion(correo: string): Observable<any> {
  //     return this._http.post<any>(this.url , { correo });
  // }
}
