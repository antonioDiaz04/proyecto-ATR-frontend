import { Component, OnInit, Inject, PLATFORM_ID } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NgxUiLoaderModule, NgxUiLoaderService } from "ngx-ui-loader";
import { CommonModule, isPlatformBrowser } from "@angular/common"; // Importa isPlatformBrowser
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { ApiInterceptor } from "./shared/services/api-interceptor.service";
import { SessionService } from "./shared/services/session.service";
import { StorageService } from "./shared/services/storage.service"; // Asegúrate de importar StorageService
import { ERol } from "./shared/constants/rol.enum";
// Importa PrimeNG Dialog y Button
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { SwPush } from "@angular/service-worker";
import { environment } from "../environments/environment";
import { IndexedDbService } from './modules/public/commons/services/indexed-db.service'; // Asegúrate de importar IndexedDbService si manejas el carrito aquí

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    RouterOutlet,
    NgxUiLoaderModule,
    CommonModule,
    DialogModule, // ✅ Importación del Dialog de PrimeNG
    ButtonModule, // ✅ Importación de los Botones de PrimeNG
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },
  ],
  templateUrl: "./app.component.html",
  // styleUrls: ["./app.component.scss",'./alert.scss'],
})
export class AppComponent implements OnInit {
  // `showWelcomeMessage` se utilizará para un mensaje general de bienvenida/inicio de sesión si el usuario no es cliente.
  showWelcomeMessage = false;
  userROL: string = "";

  publicKey: string = environment.publicKey;
  isLoading: boolean = false; // Loader general para operaciones
  firstTime: boolean = false; // Indicador para el loader de bienvenida inicial

  // Controla el diálogo específico de "Sincronizar Carrito"
  showSyncCartDialog: boolean = false;

  constructor(
    private swPush: SwPush,
    private ngxService: NgxUiLoaderService,
    private sessionService: SessionService,
    private storageService: StorageService, // Inyecta StorageService para acceder al token directamente
    private indexedDbService: IndexedDbService, // Inyecta IndexedDbService si manejas el carrito aquí
    @Inject(PLATFORM_ID) private platformId: Object // Inyecta PLATFORM_ID para verificar el entorno
  ) {}

  ngOnInit() {
    // 1. Manejo del loader de bienvenida "por primera vez" (se ejecuta una vez por sesión/instancia de navegador)
    if (isPlatformBrowser(this.platformId)) { // Aseguramos que se ejecute solo en el navegador
      if (!sessionStorage.getItem("firstSession")) {
        this.firstTime = true;
        this.showWelcomeLoader();
        // Establecemos un retraso para verificar el diálogo de sincronización DESPUÉS
        // de que el loader de bienvenida haya terminado.
        setTimeout(() => {
          this.checkAndShowSyncCartDialog();
        }, 2000); // Coincide con la duración de `showWelcomeLoader`
      } else {
        // Si no es la primera vez, verificamos el diálogo de sincronización inmediatamente.
        this.checkAndShowSyncCartDialog();
      }
    } else {
      console.warn("sessionStorage no está disponible en este entorno (no es un navegador).");
      // Si no es un navegador, también podemos intentar verificar el diálogo,
      // aunque la lógica de carrito local puede no aplicar.
      this.checkAndShowSyncCartDialog();
    }
  }

  // ✅ Loader de bienvenida (solo primera vez)
  showWelcomeLoader() {
    this.ngxService.start();
    setTimeout(() => {
      this.ngxService.stop();
      if (isPlatformBrowser(this.platformId)) {
        sessionStorage.setItem("firstSession", "true");
      }
      this.firstTime = false; // Desactiva el indicador del loader de bienvenida
    }, 2000);
  }

  // ✅ Loader de carga (para búsquedas o recargas, etc.)
  showLoadingLoader() {
    this.isLoading = true;
    this.ngxService.start();
    setTimeout(() => {
      this.ngxService.stop();
      this.isLoading = false;
    }, 1500);
  }

  /**
   * Determina el estado de inicio de sesión del usuario y establece `userROL` y `showWelcomeMessage`.
   * `showWelcomeMessage` será `true` si el usuario NO es un cliente autenticado.
   * @returns `true` si el usuario es un cliente autenticado, `false` en caso contrario.
   */
  private determineLoginStatus(): boolean {
    const userData = this.sessionService.getUserData(); // Obtiene los datos del usuario (presumiblemente del token)
    if (userData) {
      this.userROL = userData.rol;
      // `showWelcomeMessage` es `true` si el usuario NO es un cliente (ej. admin, titular, o datos inválidos)
      this.showWelcomeMessage = !(this.userROL === ERol.CLIENTE);
      return this.userROL === ERol.CLIENTE; // Retorna true si es un cliente
    }
    this.userROL = ''; // Limpia userROL si no hay datos de usuario
    this.showWelcomeMessage = true; // No hay datos de usuario, por lo tanto no está autenticado, muestra el prompt de login
    return false; // No está logueado
  }

  /**
   * Verifica el estado de inicio de sesión y decide si mostrar el diálogo de sincronización del carrito.
   */
  private checkAndShowSyncCartDialog(): void {
    const isLoggedInClient = this.determineLoginStatus(); // Esto actualiza `showWelcomeMessage` y `userROL`

    // Muestra el diálogo de sincronización del carrito SÓLO si el usuario NO es un cliente autenticado
    // Y si hay datos de carrito locales que valga la pena sincronizar.
    if (!isLoggedInClient && this.hasLocalCartData()) {
      this.showSyncCartDialog = true;
    }
  }

  /**
   * Lógica para verificar si hay datos de carrito persistidos localmente (ej. en IndexedDB o localStorage).
   * Debes implementar la lógica real aquí según cómo manejes tu carrito no autenticado.
   */
  private hasLocalCartData(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      // Ejemplo: Verifica si IndexedDB tiene elementos en el carrito
      // Aquí necesitarías que tu `IndexedDbService` tenga un método como `getCartItemsCount()` o `hasItems()`.
      // Por simplicidad, un ejemplo rudimentario:
      // return this.indexedDbService.getCartItems().length > 0;
      // O si usas localStorage:
      // return localStorage.getItem('guestCart') !== null;

      // Por ahora, retornamos `true` para que puedas ver el diálogo en acción.
      return true;
    }
    return false; // No hay carrito local si no estamos en el navegador
  }

  /**
   * Maneja la acción de sincronizar la cuenta/carrito.
   * Aquí deberías implementar la lógica para enviar los items del carrito local al backend.
   */
  sincronizarCuenta() {
    console.log("Sincronizando cuenta...");
    // TODO: Implementa tu lógica de sincronización de carrito aquí.
    // Típicamente, esto implica:
    // 1. Recuperar los elementos del carrito local (ej. de IndexedDB).
    // 2. Enviar estos elementos a tu API de backend para fusionarlos con el carrito del usuario autenticado.
    // 3. Manejar el éxito: limpiar el carrito local, cerrar el diálogo, mostrar un mensaje de éxito.
    // 4. Manejar errores.

    this.showSyncCartDialog = false; // Cierra el diálogo después de iniciar la sincronización
    // Opcional: mostrar un `toast` o mensaje de éxito/error.
  }

  /**
   * Maneja la acción de cancelar la sincronización del carrito.
   */
  cancelSyncCart() {
    this.showSyncCartDialog = false; // Cierra el diálogo
    console.log("Sincronización de carrito cancelada por el usuario.");
    // Opcional: Puedes guardar un flag en `localStorage` para no volver a mostrar este diálogo
    // si el usuario lo cierra repetidamente sin sincronizar.
    // Ejemplo: `localStorage.setItem('dismissedSyncCartDialog', 'true');`
  }

  /**
   * Método para cerrar el mensaje general de bienvenida (si es que se muestra).
   * Es independiente del diálogo de sincronización de carrito.
   */
  cerrarMensaje() {
    this.showWelcomeMessage = false;
  }

  // Lógica de notificación push (se mantiene como está)
  // notificar() {
  //   if (!this.swPush.isEnabled) {
  //     console.warn("Service Workers no están habilitados o no son compatibles con este navegador.");
  //     return;
  //   }
  //
  //   this.swPush
  //     .requestSubscription({ serverPublicKey: this.publicKey })
  //     .then((sub) => {
  //       const token = JSON.parse(JSON.stringify(sub));
  //       console.log("JSON+++++++++", token);
  //     })
  //     .catch((err) => {
  //       console.error("Error al suscribirse a notificaciones push:", err);
  //     });
  // }
}