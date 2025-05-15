import { Injectable } from '@angular/core';
import { AuthServicesModule } from './services.module';
import { HttpClient } from '@angular/common/http';
import { ISingInRequest } from '../../interfaces/sign-in-request.interface';
import { Observable } from 'rxjs';
// import { IToken } from 'src/app/shared/interfaces/token.interface';
import { environment } from '../../../../../environments/environment';

import { IToken } from '../../../../shared/interfaces/token.interface';
// import { IToken } from '../../../../shared/interfaces/token.interface';

@Injectable({
  providedIn: AuthServicesModule,
})
export class SignInService {
  constructor(private http: HttpClient) {}

  // Login con email y contraseña
  signIn(request: ISingInRequest): Observable<IToken> {
    return this.http.post<IToken>(
      `${environment.api}/auth/login`,
      request
    );
  }

  // Login con Google o Facebook
  signInWithGoogleOrFacebook(usuario: any): Observable<IToken> {
    return this.http.post<IToken>(
      `${environment.api}/autentificacion/signIn-Google-Facebook`,
      usuario
    );
  }
}
