import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = `${environment.api}/enviar-notificacion`; // Ajusta esta URL

  constructor(private http: HttpClient) { }

  // Métodos básicos
  enviarNotificacionEjemplo(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ejemplo`, datos);
  }

  enviarNotificacionYCuerpo(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/`, datos);
  }

  revisarCorreo(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/revisar-correo`, datos);
  }

  enviarNotificacion(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar-notificacion`, datos);
  }

  // Métodos específicos de productos
  enviarNotificacionNuevosProductos(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar-notificacion-nuevos-productos`, datos);
  }

  enviarNotificacionComentarios(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar-notificacion-comentarios`, datos);
  }

  enviarNotificacionComentariosRespuesta(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar-notificacion-comentarios-respuesta`, datos);
  }

  enviarNotificacionProductosOfertas(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/productos-ofertas`, datos);
  }

  // Métodos de bienvenida
  enviarNotificacionBienvenidaAteleierVentaRenta(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bienvenida-ateleier-ventayrenta`, datos);
  }

  enviarNotificacionBienvenidaAteleierComprar(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bienvenida-ateleier-comprar`, datos);
  }

  // Métodos de suscripción
  enviarNotificacionSuscripcion(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/notificacion-subscripcion`, datos);
  }

  enviarNotificacionSuscripcionRenovacion(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/notificacion-subscripcion-renovacion`, datos);
  }

  enviarNotificacionNuevosProductosSuscriptores(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/nuevos-productos-subscriptores`, datos);
  }

  // Métodos de compra y carrito
  enviarNotificacionAgradecimientoCompra(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/agradecimiento-compra`, datos);
  }

  enviarNotificacionLlevateCarrito(token:PushSubscription): Observable<any> {
    return this.http.post(`${this.apiUrl}/llevate-carrito`, { token });
  }

  enviarNotificacionLlevaTuVestido(body:any): Observable<any> {
    return this.http.post(`${this.apiUrl}/lleva-producto`, { body });
  }

  // Métodos de renta
  enviarNotificacionRentaExtendida(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/renta-extendida`, datos);
  }

  enviarNotificacionRecordatorioDevolucionRenta(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/recordatorio-devolucion-renta`, datos);
  }

  enviarNotificacionMotivacionRenta(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/motivacion-renta`, datos);
  }
}