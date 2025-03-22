import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { BaseHttpService } from '../../../../shared/services/base-http.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http);
  }

  signUpAndVerifyEmail(data: any): Observable<any> {
    const url = `${environment.api}auth/sign-up-and-verify-email`;
    return this.post(url, data);
  }

  signIn(data: any): Observable<any> {
    const url = `${environment.api}/autentificacion/signIn`;
    return this.post(url, data);
  }

  verifyEmail(token: string): Observable<any> {
    const url = `${environment.api}/auth/verify/${token}`;
    return this.get(url);
  }

  // requestPasswordRecovery(data: any): Observable<any> {
  //   const url = `${environment.api}/auth/request-password-recovery`;
  //   return this.http.post(url, data);
  // }
  // requestPasswordRecovery(data: any): Observable<any> {
  //   // return this.http.post<any>(`${this.apiUrl}/request-password-recovery`, data);
  //   const url = `${environment.api}/auth/request-password-recovery`;
  //   return this.http.post(url, data);
  // }

  requestPasswordRecovery(data: any): Observable<any> {
    const url = `${environment.api}/auth/request-password-recovery`;
    return this.post(url, data);
  }
  verifyCodeAndResetPassword(data: any): Observable<any> {
    const url = `${environment.api}/auth/verify-code-and-reset-password`;
    return this.post(url, data);
  }
  verifyVerificationCode(data: {
    correo: string;
    verificationCode: string;
  }): Observable<any> {
    const url = `${environment.api}/auth/verify-verification-code`; // Reemplaza con la ruta adecuada de tu backend
    return this.post(url, data);
  }

  consultaUsuariosPorTelefonoOCorreo(query: string): Observable<any> {
    const url = `${environment.api}/auth/consulta_us_tel_correo`;
    return this.post(url, { query });
  }

  verificca_respuest(formData: any): Observable<any> {
    return this.post<any>(
      `${environment.api}/auth/verificca_respuest`,
      formData
    );
  }

  // cambiarContrasena_(formData: any): Observable<any> {
  //   return this.http.post<any>(`${environment.api}/auth/cambiarContrasena_`, formData);
  // }
  cambiarContrasena_(formData: any): Observable<any> {
    return this.post<any>(
      `${environment.api}/auth/cambiarContrasena_`,
      formData
    );
  }
}
