import { Injectable } from '@angular/core';
import { AuthServicesModule } from './services.module';
import { HttpClient } from '@angular/common/http';
import { ISingInRequest } from '../../interfaces/sign-in-request.interface';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IToken } from '../../../../shared/interfaces/token.interface';
import { BaseHttpService } from '../../../../shared/services/base-http.service';

@Injectable({
  providedIn: AuthServicesModule,
})
export class SignInService extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http);
  }

  // Login con email y contraseña
  signIn(request: ISingInRequest): Observable<IToken> {
    return this.post<IToken>(
      `${environment.api}/autentificacion/signIn`,
      request
    );
  }

  // Login con Google o Facebook
  signInWithGoogleOrFacebook(usuario: any): Observable<IToken> {
    return this.post<IToken>(
      `${environment.api}/autentificacion/signIn-Google-Facebook`,
      usuario
    );
  }
}
