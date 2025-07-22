import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  constructor(private http: HttpClient) {}

  enviarCorreo(email: string): Observable<any> {
    return this.http.post<any>(`${environment.api}/enviar-correo`, { email });
  }
  checkEmailExists(email: string): Observable<any> {
    return this.http.post<any>(
      environment.api + '/usuarios/check-email',
      { email },
      {
        withCredentials: true,
      }
    );
  }

  guardarCarrito(productos: any[], idUsuario: string): Observable<any> {
    return this.http.post(`${environment.api}/carrito/guardar`, { productos, idUsuario }, {
      withCredentials: true,
    });
  }

  // eliminarProductoCarrito
  eliminarProductoCarrito(idUsuario: string, idProducto: string): Observable<any> {
    return this.http.delete(`${environment.api}/carrito/eliminar/${idUsuario}/${idProducto}`, {
      withCredentials: true,
    });
  }
  vaciarCarrito(idUsuario: string): Observable<any> {
    return this.http.delete(`${environment.api}/carrito/vaciar/${idUsuario}`, {
      withCredentials: true,
    });
  }

  obtenerCarrito(idUsuario: string): Observable<any> {
    return this.http.get(`${environment.api}/carrito/byIdUsuario/${idUsuario}`, {
      withCredentials: true,
    });
  }


  getPreguntaSecreta(email: any): Observable<any> {
    return this.http.post<any>(
      environment.api + '/verificacion/verificar-correo',
      { email },
      {
        withCredentials: true,
      }
    );
  }
  // Método para verificar la respuesta secreta
  verificarRespuestaSecreta(email: string, respuesta: string): Observable<any> {
    const body = { email, respuesta };
    return this.http.post(
      `${environment.api}/verificacion/verificar-respuesta`,
      body
    );
  }
  checkTelefonoExists(telefono: string): Observable<any> {
    return this.http.post<any>(
      environment.api + '/usuarios/check-telefono',
      { telefono },
      {
        withCredentials: true,
      }
    );
  }
  checkCode(code: number): Observable<any> {
    return this.http.post<any>(
      environment.api + '/usuarios/check-code',
      { code },
      {
        withCredentials: true,
      }
    );
  }
  enviarCodido(email: number): Observable<any> {
    return this.http.post<any>(
      environment.api + '/enviar-correo/code',
      { email },
      {
        withCredentials: true,
      }
    );
  }
  getUsuarios(): Observable<any> {
    return this.http.get(environment.api + '/usuarios');
  }

  register(usuario: Usuario): Observable<any> {
    return this.http.post<any>(environment.api + '/usuarios', usuario, {
      withCredentials: true,
    });
  }
  enviarReporte(reporteData: any, id: any): Observable<any> {
    return this.http.post(
      environment.api + `/usuarios/reportes/${id}`,
      reporteData,
      {
        withCredentials: true,
      }
    );
  }

  enviarToken(email: string, codigoVerificacion: string): Observable<any> {
    return this.http.post<boolean>(
      environment.api + '/verificacion/activar-cuenta',
      { email, codigoVerificacion }
    );
  }

  actualizaPasswordxCorreo(email: any, nueva: string): Observable<any> {
    return this.http.put<boolean>(
      environment.api + '/usuarios/actualizaxCorreo',
      {
        email,
        nueva,
      }
    );
  }

  actualizarUsuario(email: string, nueva: string): Observable<any> {
    return this.http.put<boolean>(
      environment.api + '/usuarios/actualizaxCorreo',
      {
        email,
        nueva,
      }
    );
  }

  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete(environment.api + '/usuarios/' + id);
  }

  detalleUsuarioById(id: string): Observable<any> {
    //return this.http.get(`${this.apiUrl}/${id}`);
    return this.http.get(`${environment.api}/usuarios/` + id);
  }
  vincularDispositivo(data: any): Observable<any> {
    const url = `${environment.api}/autentificacion/vincular-Dispositivo-Wear`;
    return this.http.post(url, data);
  }
}
