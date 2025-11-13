import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignInService {

  constructor(private http:HttpClient ) { }
  // En tu signIn.service.ts
  loginWithQRToken(token: string): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post(`${environment.api}/auth/qr-login`, { token }, { headers });
  }
}
