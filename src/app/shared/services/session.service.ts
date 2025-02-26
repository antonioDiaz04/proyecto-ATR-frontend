import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { StorageService } from './storage.service';
import { Iuser } from '../interfaces/user.interface';
import * as CryptoJS from 'crypto-js';
import * as bcrypt from 'bcryptjs'; // Asegúrate de instalar bcryptjs en tu proyecto
@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private helper = new JwtHelperService();

  get token(): string | null {
    return this.storageService.getToken();
  }

  constructor(private storageService: StorageService) {}

  getUserData(): Iuser | undefined {
    const { token } = this;
    if (token) {
      const decodedData = this.helper.decodeToken(token);
      return decodedData;
    }
    return undefined;
  }

  
  getUserTokenDecode(token: string, providedCode: string): boolean {
    try {
      const decodedData: any = this.helper.decodeToken(token);

      if (decodedData?.hashedCode) {
        const isMatch = bcrypt.compareSync(
          providedCode,
          decodedData.hashedCode
        );
        return isMatch;
      } else {
        console.error('El token no contiene un hash válido.');
      }
    } catch (error) {
      console.error('Error al decodificar o validar el token:', error);
    }
    return false;
  }
  getUserPasswordDecode(password: string): string {
    try {
      const decodedData: any = this.helper.decodeToken(password);
      
      if (decodedData?.hashedCode) {
        return decodedData.hashedCode; // Devuelve el hash decodificado
      } else {
        console.error('El token no contiene un hash válido.');
        return 'Hash inválido';
      }
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return 'Error al decodificar';
    }
  }

  // Descifrar un texto
  // Función para descifrar el texto
  descifrarTexto(encryptedData: string): string {
    const key = encryptedData; // La clave secreta usada para cifrar
    const ivHex = '0000000000000000'; // El IV utilizado para cifrar

    // Decrypt using AES
    const bytes = CryptoJS.AES.decrypt(
      encryptedData,
      CryptoJS.enc.Utf8.parse(key),
      {
        iv: CryptoJS.enc.Utf8.parse(ivHex), // Vector de inicialización en formato hexadecimal
        mode: CryptoJS.mode.CBC, // Modo CBC
        padding: CryptoJS.pad.Pkcs7, // Relleno con PKCS7
      }
    );

    // Convierte los bytes descifrados en un texto legible
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    // Si la descifrado da un texto vacío, es posible que haya un problema con el IV o la clave
    if (!decryptedText) {
      throw new Error('No se pudo descifrar el texto correctamente');
    }

    return decryptedText; // Retorna el texto descifrado
  }

  getRol(): string {
    const userData = this.getUserData();
    return userData ? userData.rol : 'invitado';
  }

  getId(): string | null {
    const userData = this.getUserData();
    return userData ? userData._id : null;
  }

  isAutenticated(): boolean {
    return !!this.token && !this.isTokenExpired();
  }

  isTokenExpired(): boolean {
    const token = this.token;
    return token ? this.helper.isTokenExpired(token) : true;
  }

  removeToken(): void {
    this.storageService.removeItem('token');
  }

  // Guardar el ID de salida en sessionStorage

  // Obtener el ID de salida desde storageService
  getIdSalida(): string | null {
    return this.storageService.getIdSalidaActual();
  }
  getCantidadSalida(): number | null {
    return this.storageService.getCantidad();
  }

  // Eliminar el ID de salida de storageService
  // removeIdSalida(): void {
  //   this.storageService.removeItem(this.salidaKey);
  // }

  // // Limpiar toda la sesión si es necesario
  // clearSession(): void {
  //   this.storageService.clear();
  // }
}
