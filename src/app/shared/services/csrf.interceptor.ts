import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const csrfToken = this.getCsrfToken(); // Recupera el token CSRF desde las cookies

    if (csrfToken) {
      // Si se encuentra el token CSRF, lo agregamos en la cabecera X-XSRF-TOKEN
      req = req.clone({
        setHeaders: {
          'X-XSRF-TOKEN': csrfToken,
        },
      });
    }

    return next.handle(req);
  }

  // Método para obtener el token CSRF desde las cookies
  private getCsrfToken(): string | null {
    const csrfToken = document.cookie.split(';').find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
    return csrfToken ? csrfToken.split('=')[1] : null;
  }
}
