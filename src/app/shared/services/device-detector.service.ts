// src/app/services/device-detector.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DeviceDetectorService {
  isMobile(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false; // Evita errores en entornos donde no hay `window` o `navigator`
    }
    const userAgent = navigator.userAgent || navigator.vendor || ''; // Asegura que no sea undefined

    // Detecta dispositivos móviles basándose en el userAgent o el ancho de la ventana
    return (
      /android|iPad|iPhone|iPod/i.test(userAgent) || window.innerWidth <= 768
    );
  }
}
