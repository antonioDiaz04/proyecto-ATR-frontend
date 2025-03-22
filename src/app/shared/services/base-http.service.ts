import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BaseHttpService {
  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error inesperado. Inténtalo de nuevo.';

    if (error.status === 0) {
      errorMessage =
        'No se pudo conectar al servidor. Verifica tu conexión a internet.';
    } else if (error.status >= 400 && error.status < 500) {
      errorMessage = error.error?.message || 'Solicitud inválida.';
    } else if (error.status >= 500) {
      errorMessage = 'Error del servidor. Inténtalo más tarde.';
    }

    console.error('Error capturado:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Método genérico para GET
  get<T>(url: string): Observable<T> {
    return this.http
      .get<T>(url)
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Método genérico para POST
  post<T>(url: string, body: any, options: { withCredentials?: boolean } = {}): Observable<T> {
    return this.http.post<T>(url, body, options).pipe(
      catchError((error) => this.handleError(error))
    );
  }
  

  // Método genérico para PUT
  put<T>(url: string, body: any): Observable<T> {
    return this.http
      .put<T>(url, body)
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Método genérico para DELETE
  delete<T>(url: string): Observable<T> {
    return this.http
      .delete<T>(url)
      .pipe(catchError((error) => this.handleError(error)));
  }
}
