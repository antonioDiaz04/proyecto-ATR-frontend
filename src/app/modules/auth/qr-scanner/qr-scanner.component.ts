import { Component, Output, EventEmitter, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule, ZXingScannerComponent } from '@zxing/ngx-scanner';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule, FormsModule],
  template: `
    <div class="qr-scanner-wrapper">
      <!-- Selector de cámara chips -->
      <div class="camera-selector" *ngIf="hasMultipleCameras">
        <button *ngFor="let cam of cameraOptions; let i = index" 
                class="camera-chip" 
                [class.active]="selectedCameraId === cam.deviceId"
                (click)="selectCamera(cam.deviceId)">
          <i [class]="cam.icon"></i>
          {{ cam.name }}
        </button>
      </div>

      <!-- Área de escaneo -->
      <div class="scanner-area" [class.scanning]="!isLoading && !scanSuccess">
        <!-- ZXing Scanner - SIEMPRE renderizado -->
        <zxing-scanner #scanner 
                      [enable]="scannerEnabled" 
                      [device]="selectedDevice"
                      (camerasFound)="onCamerasFound($event)"
                      (camerasNotFound)="onCamerasNotFound($event)"
                      (scanSuccess)="onScanSuccess($event)"
                      (permissionResponse)="onPermissionResponse($event)">
        </zxing-scanner>
        
        <!-- Overlay éxito -->
        <div class="success-overlay" *ngIf="scanSuccess">
          <div class="success-icon">✅</div>
          <p>¡Código detectado!</p>
        </div>

        <!-- Overlay carga -->
        <div class="loading-overlay" *ngIf="isLoading">
          <div class="spinner"></div>
          <p>Iniciando cámara...</p>
        </div>
      </div>

      <!-- Mensaje error -->
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    @keyframes spinner { to { transform: rotate(360deg); } }
    @keyframes scannerLine { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
    @keyframes successPulse { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
    
    .qr-scanner-wrapper { position: relative; background: #000; border-radius: 12px; overflow: hidden; min-height: 450px; }
    
    .camera-selector { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); z-index: 10; display: flex; gap: 12px; }
    .camera-chip { background: rgba(0,0,0,0.6); color: white; border: 2px solid transparent; padding: 10px 20px; border-radius: 25px; cursor: pointer; transition: all 0.3s; font-size: 0.9rem; backdrop-filter: blur(10px); display: flex; align-items: center; gap: 8px; }
    .camera-chip:hover { background: rgba(255,255,255,0.2); transform: translateY(-2px); }
    .camera-chip.active { border-color: #4CAF50; background: rgba(76, 175, 80, 0.4); box-shadow: 0 0 15px rgba(76, 175, 80, 0.5); }
    
    .scanner-area { position: relative; min-height: 450px; display: flex; align-items: center; justify-content: center; }
    .scanner-area.scanning::before { content: ''; position: absolute; inset: 20px; border: 3px solid rgba(255,255,255,0.2); border-radius: 12px; z-index: 2; pointer-events: none; }
    .scanner-area.scanning::after { content: ''; position: absolute; top: 20px; left: 20px; right: 20px; height: 3px; background: linear-gradient(90deg, transparent, #4CAF50, transparent); animation: scannerLine 2.5s linear infinite; z-index: 3; }
    
    zxing-scanner { width: 100% !important; height: auto !important; display: block; }
    
    .success-overlay, .loading-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; z-index: 20; background: rgba(0,0,0,0.85); }
    .success-icon { font-size: 5rem; animation: successPulse 0.5s ease-out; }
    .spinner { width: 50px; height: 50px; border: 5px solid rgba(255,255,255,0.3); border-top: 5px solid #4CAF50; border-radius: 50%; animation: spinner 1s linear infinite; margin-bottom: 15px; }
    
    .error-message { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(244,67,54,0.9); color: white; padding: 15px; text-align: center; font-size: 0.95rem; z-index: 15; backdrop-filter: blur(5px); }
  `]
})
export class QRScannerComponent implements AfterViewInit, OnDestroy {
  @Output() scanComplete = new EventEmitter<string>();
  @ViewChild('scanner', { static: false }) scanner!: ZXingScannerComponent;
  
  cameras: MediaDeviceInfo[] = [];
  cameraOptions: { deviceId: string; name: string; icon: string }[] = [];
  selectedDevice: MediaDeviceInfo | undefined;
  selectedCameraId: string = '';
  scannerEnabled = false;
  isLoading = true;
  hasMultipleCameras = false;
  scanSuccess = false;
  error = '';

  ngAfterViewInit(): void {
    // ✅ INICIALIZAR INMEDIATAMENTE después de renderizar
    console.log('🔍 Componente QR renderizado');
    setTimeout(() => {
      this.initializeScanner();
    }, 100);
  }

  private initializeScanner(): void {
    console.log('🎬 Iniciando scanner ZXing...');
    this.scannerEnabled = true; // ✅ ESTO ACTIVA LA CÁMARA
    this.isLoading = true;
  }

  onCamerasFound(cameras: MediaDeviceInfo[]): void {
    console.log('✅ Cámaras detectadas:', cameras.length, cameras);
    this.cameras = cameras;
    this.hasMultipleCameras = cameras.length > 1;
    
    this.cameraOptions = cameras.map((camera) => ({
      deviceId: camera.deviceId,
      name: camera.label.toLowerCase().includes('back') || camera.label.toLowerCase().includes('trasera') 
              ? '📷 Trasera' 
              : '🤳 Frontal',
      icon: camera.label.toLowerCase().includes('back') ? 'pi pi-camera' : 'pi pi-user'
    }));

    if (cameras.length > 0) {
      // Seleccionar cámara trasera por defecto
      const backCamera = cameras.find(cam => 
        cam.label.toLowerCase().includes('back') || cam.label.toLowerCase().includes('trasera')
      );
      this.selectedDevice = backCamera || cameras[0];
      this.selectedCameraId = this.selectedDevice.deviceId;
      console.log('📷 Cámara activa:', this.selectedDevice.label);
      setTimeout(() => this.isLoading = false, 500);
    }
  }

  onCamerasNotFound(error: any): void {
    console.error('❌ ERROR: No se encontraron cámaras', error);
    this.error = 'No se encontró ninguna cámara disponible.';
    this.isLoading = false;
    this.scannerEnabled = false;
  }

  onPermissionResponse(hasPermission: boolean): void {
    console.log('🔐 Permiso de cámara:', hasPermission);
    if (!hasPermission) {
      this.error = 'Permiso denegado. Activa el acceso a la cámara en configuración.';
      this.isLoading = false;
      this.scannerEnabled = false;
    }
  }

  onScanSuccess(result: string): void {
    if (result && !this.scanSuccess) {
      console.log('✅ QR DETECTADO:', result);
      this.scanSuccess = true;
      this.scannerEnabled = false; // Detener scanner
      
      // Emitir resultado después de animación
      setTimeout(() => {
        this.scanComplete.emit(result);
      }, 1200);
    }
  }

  selectCamera(deviceId: string): void {
    this.selectedCameraId = deviceId;
    const camera = this.cameras.find(c => c.deviceId === deviceId);
    if (camera) {
      this.selectedDevice = camera;
      this.scannerEnabled = false;
      setTimeout(() => this.scannerEnabled = true, 100); // Reiniciar con nueva cámara
      this.error = '';
      console.log('🔄 Cámara cambiada:', camera.label);
    }
  }

  private stopScanner(): void {
    this.scannerEnabled = false;
    this.isLoading = true;
    this.scanSuccess = false;
  }

  ngOnDestroy(): void {
    console.log('🚫 Destruyendo componente QR');
    this.stopScanner();
  }
}