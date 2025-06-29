import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RecaptchaService {
  constructor(private http: HttpClient) {}

  getTokenClientModule(token: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    return this.http
      .post<any>(`${environment.api}/verificar/' + token + '/`, httpOptions)

      .pipe(
        map((response) => response),

        catchError((err) => {
          console.log('error caught in service');

          console.error(err);

          return throwError(err);
        })
      );
  }
}
