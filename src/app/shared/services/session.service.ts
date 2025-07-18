import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { StorageService } from './storage.service';
import { Iuser } from '../interfaces/user.interface';
import * as CryptoJS from 'crypto-js';
import * as bcrypt from 'bcryptjs';
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

  descifrarTexto(encryptedData: string): string {
    const key = encryptedData;
    const ivHex = '0000000000000000';

    // Decrypt using AES
    const bytes = CryptoJS.AES.decrypt(
      encryptedData,
      CryptoJS.enc.Utf8.parse(key),
      {
        iv: CryptoJS.enc.Utf8.parse(ivHex),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    // Convierte los bytes descifrados en un texto legible
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

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

  // Obtener el ID de salida desde storageService
  getIdSalida(): string | null {
    return this.storageService.getIdSalidaActual();
  }
  getCantidadSalida(): number | null {
    return this.storageService.getCantidad();
  }
}
