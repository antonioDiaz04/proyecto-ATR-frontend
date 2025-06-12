import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = `${environment.api}/notificacion`; // Ajusta esta URL si es necesario

  constructor(private http: HttpClient) { }

  // 🔐 Guarda la suscripción push (endpoint + claves) en el backend
  guardarSuscripcionPush(suscripcion: PushSubscription): Observable<any> {
    return this.http.post(`${this.apiUrl}/guardar-suscripcion`, suscripcion);
  }

  // 🧪 Notificación simple de ejemplo
  enviarNotificacionEjemplo(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ejemplo`, datos);
  }

  // 📨 Notificación genérica con cuerpo
  enviarNotificacionYCuerpo(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/`, datos);
  }

  // ✅ Verifica correo válido o activo
  revisarCorreo(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/revisar-correo`, datos);
  }

  // 🔔 Notificación general
  enviarNotificacion(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar-notificacion`, datos);
  }

  // 🎁 Nuevos productos
  enviarNotificacionNuevosProductos(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar-notificacion-nuevos-productos`, datos);
  }

  // 💬 Comentarios y respuestas
  enviarNotificacionComentarios(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar-notificacion-comentarios`, datos);
  }

  enviarNotificacionComentariosRespuesta(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar-notificacion-comentarios-respuesta`, datos);
  }

  // 💸 Ofertas
  enviarNotificacionProductosOfertas(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/productos-ofertas`, datos);
  }

  // 🙌 Bienvenidas
  enviarNotificacionBienvenidaAteleierVentaRenta(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bienvenida-ateleier-ventayrenta`, datos);
  }

  enviarNotificacionBienvenidaAteleierComprar(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bienvenida-ateleier-comprar`, datos);
  }

  // 🔄 Suscripciones
  enviarNotificacionSuscripcion(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/notificacion-subscripcion`, datos);
  }

  enviarNotificacionSuscripcionRenovacion(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/notificacion-subscripcion-renovacion`, datos);
  }

  enviarNotificacionNuevosProductosSuscriptores(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/nuevos-productos-subscriptores`, datos);
  }

  // 🛒 Compras y carrito
  enviarNotificacionAgradecimientoCompra(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/agradecimiento-compra`, datos);
  }

  enviarNotificacionLlevateCarrito(token: PushSubscription): Observable<any> {
    return this.http.post(`${this.apiUrl}/llevate-carrito`, { token });
  }

  enviarNotificacionLlevaTuVestido(body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/lleva-producto`, { body });
  }

  // 🧾 Renta
  enviarNotificacionRentaExtendida(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/renta-extendida`, datos);
  }

  enviarNotificacionRecordatorioDevolucionRenta(datos: PushSubscription): Observable<any> {
    return this.http.post(`${this.apiUrl}/recordatorio-devolucion-renta`, { datos });
  }

  enviarNotificacionMotivacionRenta(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/motivacion-renta`, { datos });
  }


  obtenerNotificaciones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/obtener-notificaciones`);
  }
  obtenerNotificacionesPorUsuario(usuarioId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/obtener-notificaciones-MyId/${usuarioId}`);
  }
  marcarComoLeido(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/marcar-como-leido/${id}`, {});
  }
  marcarVariasComoLeidas(ids: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/marcar-varias-como-leidas`, { ids });
  }
}
