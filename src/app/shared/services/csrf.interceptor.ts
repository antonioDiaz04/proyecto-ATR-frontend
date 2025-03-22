import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
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
    if (isPlatformBrowser(this.platformId)) {
      const csrfToken = document.cookie
        .split(';')
        .find((cookie) => cookie.trim().startsWith('XSRF-TOKEN='));
      return csrfToken ? csrfToken.split('=')[1] : null;
    }
    return null;
  }
}
