import { response } from 'express';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Output,
  PLATFORM_ID,
  Renderer2,
  EventEmitter,
  Input,
  OnInit,
  SimpleChanges,
  OnChanges,
  AfterViewInit,
  ViewChild,
  NgZone,
  inject,
} from '@angular/core';
import { IndexedDbService } from '../../../modules/public/commons/services/indexed-db.service';
import { mensageservice } from '../../services/mensage.service';
import { StorageService } from '../../services/storage.service';
import { SignInService } from '../../../modules/auth/commons/services/sign-in.service';
import { SessionService } from '../../services/session.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DatosEmpresaService } from '../../services/datos-empresa.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ThemeServiceService } from '../../services/theme-service.service';
import { Router } from '@angular/router'; // Asegúrate de importar Router
import { interval, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ERol } from '../../constants/rol.enum';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { HttpClientModule } from '@angular/common/http';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { PasswordModule } from 'primeng/password';
import AOS from 'aos';

import {
  Auth,
  signInWithPopup,
  FacebookAuthProvider,
  GoogleAuthProvider,
} from '@angular/fire/auth';

@Component({
  selector: 'app-login-modal',
  standalone: true, // Marca el componente como standalone
  imports: [
    /* The SidebarModule in the Angular code you provided is being imported in the HeaderComponent class. This module is likely a custom Angular module or a module provided by a third-party library (such as PrimeNG) that provides functionality related to displaying a sidebar component. */
    FormsModule,
    ToastModule,
    InputTextModule,
    InputNumberModule,
    ConfirmDialogModule,
    MessageModule,
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputGroupModule,
    PasswordModule,

    HttpClientModule,
  ], // Importa las dependencias necesarias
  templateUrl: './login-modal.component.html',
})
export class LoginModalComponent implements OnInit, OnChanges, AfterViewInit {
  isLoading = false;
  userROL!: string;
  // Logo=logoAtelier
  count!: number;
  captchaToken: string | null = null;
  //
  auth: Auth = inject(Auth);
  maxAttempts: number = 5; // Se puede asignar un número o 0 más adelante

  attempts: number = 0; // Contador de intentos actuales
  isLocked: boolean = false; // Estado para saber si está bloqueado
  lockTime: number = 30; // Tiempo de bloqueo en segundos
  remainingTime: number = 0; // Tiempo restante para volver a intentar
  timerSubscription!: Subscription;

  loginForm: FormGroup;
  isGoogleLogin = false;

  errorMessage: string = '';
  loginError: string = ''; // Nueva variable para el mensaje de error
  // userROL!: string;
  loading: boolean = false;
  captchagenerado: boolean = false;
  //datos de la empresa
  logo!: string;
  nombreEmpresa: string = 'Atelier';
  visible: boolean = false;
  passwordStrengthClass: string = ''; // Clase CSS que se aplica dinámicamente
  passwordStrengthMessage: string = ''; // Mensaje dinámico que se muestra debajo del campo
  captcha = '';

  faltantes: string[] = []; // Lista de requisitos faltantes
  showPassword: boolean = false;
  border: any;
  constructor(
    private indexedDbService: IndexedDbService,
    private msgs: mensageservice,
    private signInService: SignInService,
    private storageService: StorageService,
    private sessionService: SessionService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private datosEmpresaService: DatosEmpresaService,
    private ngxService: NgxUiLoaderService,
    private renderer: Renderer2,
    // private sessionService: SessionService,
    private elementRef: ElementRef,
    public themeService: ThemeServiceService,
    private cdr: ChangeDetectorRef,
    //para lo del capchat
    private ngZone: NgZone,
    private router: Router, // Inyecta el Router

    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group(
      {
        email: [
          '',
          [
            Validators.pattern(/^[\w.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
          ],
        ],
        telefono: [
          '',
          [Validators.pattern(/^[0-9]{10}$/)],
        ],
        password: ['', Validators.required], // Validador requerido para la contraseña
        captcha: ['', Validators.required], // Validador requerido para el captcha
      },
      { validator: this.atLeastOneRequired('email', 'telefono') }
    );
    this.toggleValidation();

    this.isLoading = false;
  }

  // Función personalizada para validar que al menos un campo esté lleno
  atLeastOneRequired(control1: string, control2: string) {
    return (formGroup: FormGroup) => {
      const value1 = formGroup.controls[control1].value;
      const value2 = formGroup.controls[control2].value;

      if (!value1 && !value2) {
        formGroup.controls[control1].setErrors({ required: true });
        formGroup.controls[control2].setErrors({ required: true });
      } else {
        formGroup.controls[control1].setErrors(null);
        formGroup.controls[control2].setErrors(null);
      }
    };
  }
  async ngOnInit() {
    AOS.init({
      duration: 650, // Duración de la animación en milisegundos
      // easing: 'ease-in-out', // Tipo de animación
      once: true, // Si true, la animación solo se ejecuta una vez
    });

    this.getCaptchaToken();
    this.loadCaptchaScript();

    // Marcar el formulario como "tocado" cuando el usuario interactúe
    this.loginForm.valueChanges.subscribe(() => {
      this.loginForm.markAllAsTouched();
    });

    // *NUEVO: Verificar sesión al iniciar el componente*
    this.checkSessionAndRedirect();
  }

  toggleValidation() {
    if (this.usePhoneLogin) {
      // Si usa teléfono, el campo email no es obligatorio
      this.loginForm.get('email')?.clearValidators();
      this.loginForm.get('telefono')?.setValidators([Validators.required, Validators.pattern('^[0-9]{10}$')]);
    } else {
      // Si usa email, el campo teléfono no es obligatorio
      this.loginForm.get('telefono')?.clearValidators();
      this.loginForm.get('email')?.setValidators([Validators.required, Validators.pattern(/^[\w.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]);
    }

    this.loginForm.get('email')?.updateValueAndValidity();
    this.loginForm.get('telefono')?.updateValueAndValidity();
  }

  @ViewChild('passwordField') passwordField!: ElementRef;

  ngAfterViewInit() {
    this.cargarWidgetRecaptcha();
    this.passwordField.nativeElement.setAttribute(
      'autocomplete',
      'current-password'
    );

    // Verificar si grecaptcha.ready está disponible
    if (typeof grecaptcha !== 'undefined' && 'ready' in grecaptcha) {
      grecaptcha.ready(() => {
        grecaptcha.render('captcha-container', {
          sitekey: '6Ld8joAqAAAAABuc_VUhgDt7bzSOYAr7whD6WeNI',
          callback: (token: string) => {
            this.validateCaptcha(); // Validar el captcha cuando cambie
          },
        });
      });
    }
  }

  cargarWidgetRecaptcha() {
    if (typeof grecaptcha !== 'undefined') {
      grecaptcha.render('captcha-container', {
        sitekey: '6Ld8joAqAAAAABuc_VUhgDt7bzSOYAr7whD6WeNI',
        callback: (token: string) => {
          this.getCaptchaToken(); // Llamar a getCaptchaToken cuando el captcha se resuelva
        },
      });
    } else {
      console.error('El cliente de reCAPTCHA no está disponible.');
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  public robot!: boolean;
  public presionado!: boolean;

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  usePhoneLogin: boolean = false;

  toggleLoginMethod() {
    this.usePhoneLogin = !this.usePhoneLogin;
    // Limpiar validaciones al cambiar el método
    this.loginForm.get('email')?.reset();
    this.loginForm.get('telefono')?.reset();
  }

  @Input() isModalVisible: boolean = false;
  @Output() closed: EventEmitter<string> = new EventEmitter<string>(); // Aquí se define correctamente
  @Output() mostrarFormulario = new EventEmitter<boolean>(); // Evento para cerrar el modal

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isModalVisible']) {
      console.log(
        'Estado del modal cambiado:',
        changes['isModalVisible'].currentValue
      );
    }
  }

  close(): void {
    this.mostrarFormulario.emit(false); // Emitimos false para cerrar el modal
    this.closed.emit('Modal cerrado correctamente'); // Se emite el evento correctamente
  }

  getCaptchaToken(): string {
    if (typeof grecaptcha !== 'undefined') {
      const token = grecaptcha.getResponse();
      if (!token) {
        console.warn('Token no generado todavía.');
        this.loginForm.get('captcha')?.setValue(''); // Limpiar el valor si no hay token
      } else {
        this.loginForm.get('captcha')?.setValue(token); // Actualizar el valor del captcha en el formulario
      }
      return token;
    } else {
      console.error('reCAPTCHA no ha sido cargado.');
      return '';
    }
  }
  loadCaptchaScript() {
    if (typeof document === 'undefined') {
      console.warn(
        'No se puede cargar el script porque document no está definido.'
      );
      return;
    }

    const scriptId = 'recaptcha-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.google.com/recaptcha/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('reCAPTCHA script loaded');
        this.cargarWidgetRecaptcha(); // Llamar a cargarWidgetRecaptcha después de cargar el script
      };
      document.body.appendChild(script);
    } else {
      console.log('El script de reCAPTCHA ya está cargado.');
    }
  }

  traerDatos() {
    this.datosEmpresaService.traerDatosEmpresa().subscribe(
      (data) => {
        if (Array.isArray(data) && data.length > 0) {
          const empresaData = data[0];
          // this.logo = empresaData.logo;
          this.nombreEmpresa = empresaData.tituloPagina;
        } else {
          console.error('No se encontraron datos de la empresa.');
        }
      },
      (error) => {
        console.error('Error al cargar datos de la empresa', error);
      }
    );
  }

  validateCaptcha() {
    const token = grecaptcha.getResponse();
    if (token) {
      this.loginForm.get('captcha')?.setValue(token); // Actualiza el valor del captcha en el formulario
      this.loginForm.get('captcha')?.markAsUntouched();
      return token;
    } else {
      this.loginForm.get('captcha')?.setValue(''); // Limpia el valor si no hay token
      return null;
    }
  }

  inicia() {
    this.ngxService.start(); // start foreground spinner of the master loader with 'default' taskId
    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground spinner of the master loader with 'default' taskId
    }, 3000);

    // OR
    this.ngxService.startBackground('do-background-things');
    // Do something here...
    this.ngxService.stopBackground('do-background-things');

    this.ngxService.startLoader('loader-01'); // start foreground spinner of the loader "loader-01" with 'default' taskId
    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stopLoader('loader-01'); // stop foreground spinner of the loader "loader-01" with 'default' taskId
    }, 3000);
  }

  passwordIncorrecta = false;

  verificarPassword() {
    this.faltantes = [];
    const password = this.loginForm.get('password')?.value || '';

    if (password.length < 8) {
      this.faltantes.push('Al menos 8 caracteres.');
    }
    if (!/[A-Z]/.test(password)) {
      this.faltantes.push('Al menos una letra mayúscula.');
    }
    if (!/[0-9]/.test(password)) {
      this.faltantes.push('Al menos un número.');
    }
    if (!/[^\w\s]/.test(password)) {
      this.faltantes.push('Al menos un carácter especial.');
    }

    this.passwordIncorrecta =
      this.faltantes.length === 0 && password.length > 0;
  }

  login(): void {
    this.loginForm.markAllAsTouched();
    this.errorMessage = ''; // Limpia el mensaje de error anterior
    this.loginError = '';
    this.captchaToken = this.loginForm.get('captcha')?.value;
    this.isLoading = true;
    this.toggleValidation()
    if (this.isLocked) {
      this.loginError = "Has alcanzado el límite de intentos. Intenta de nuevo en ${this.remainingTime} segundos.";
      this.isLoading = false;
      return;
    }

    if (!navigator.onLine) {
      this.loginError =
        'Por favor, verifica tu conexión y vuelve a intentarlo.';
      this.isLoading = false;
      return;
    }

    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    const telefono = this.loginForm.value.telefono;

    this.signInService
      .signIn({ email, password, telefono, captchaToken: this.captchaToken })
      .subscribe(
        (response) => {
          if (response) {
            this.storageService.setToken(response.token);
            const userData = this.sessionService.getUserData();
            this.isLoading = false;

            if (userData) {
              this.userROL = userData.rol;
              let navigateTo = '';
              console.log(this.userROL);
              if (this.userROL === ERol.ADMIN) {
                navigateTo = '/admin/home';
              } else if (this.userROL === ERol.CLIENTE) {
                navigateTo = '/inicio';
              } else if (this.userROL === ERol.TITULAR) {
                navigateTo = '/titular/home';
              }

              // *NUEVO: Guardar la ruta actual antes de navegar*
              if (isPlatformBrowser(this.platformId)) {
                localStorage.setItem('lastVisitedRoute', this.router.url);
              }

              this.router.navigate([navigateTo]).then(() => {
                if (navigateTo === '/inicio') {
                  window.location.reload();
                }
                this.inicia();
                // *Considera si realmente necesitas recargar la página completa aquí.*
                // Una recarga total puede ser disruptiva para el flujo de usuario.
                // Si la interfaz de usuario se actualiza correctamente con el navigate,
                // la recarga podría ser innecesaria.
                // window.location.reload();
              });
            }
          }
        },
        (err) => {
          console.error('Error en el inicio de sesión:', err);
          this.isLoading = false; // Restablecer el estado de carga

          if (err.status === 401) {
            this.errorMessage =
              'Credenciales inválidas. Por favor, verifica tu correo y contraseña.';
          } else if (err.status === 403) {
            this.loginError = err.error.message; // Mostrar el mensaje del servidor
            this.attempts = err.error.numeroDeIntentos; // Actualizar el número de intentos
            this.lockTime = parseInt(err.error.tiempo, 10); // Convertir el tiempo de bloqueo a número
            this.lockAccount();
            console.log(
              'Temporizador iniciado. Tiempo restante:',
              this.remainingTime
            );
          } else if (
            err.status === 400 &&
            err.error.message === 'Captcha inválido'
          ) {
            this.loginError =
              'Captcha inválido. Por favor, inténtalo de nuevo.';
            if (typeof grecaptcha !== 'undefined') {
              grecaptcha.reset(); // Reiniciar el reCAPTCHA
            }
          } else if (err.status === 0) {
            this.loginError =
              'Error de conexión. Por favor, verifica tu conexión a internet o intenta más tarde.';
          } else {
            this.loginError = 'Ha ocurrido un error al iniciar sesión.';
          }

          // Forzar la actualización de la vista
          this.cdr.detectChanges();
        }
      );
  }

  async loginWithGoogle() {
    this.isGoogleLogin = true;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      this.loginForm.reset();
      if (result.user) {
        const usuario = {
          uid: result.user.uid, // ID único del usuario
          email: result.user.email, // Correo electrónico
          displayName: result.user.displayName, // Nombre completo
          photoURL: result.user.photoURL, // Foto de perfil
          createdAt: new Date(), // Fecha de creación
          phoneNumber: result.user.phoneNumber || '', //numero de telefeno
        };

        console.log('Usuario autenticado:', result.user);

        this.registrarUsuario(usuario);
      }
    } catch (error) {
      console.error('Error en la autenticación:', error);
    }
  }

  async loginWithFacebook() {
    const provider = new FacebookAuthProvider(); // Crea el proveedor de Facebook
    try {
      const result = await signInWithPopup(this.auth, provider); // Inicia sesión con Facebook
      this.loginForm.reset(); // Limpia el formulario

      if (result.user) {
        const usuario = {
          uid: result.user.uid, // ID único del usuario
          email: result.user.email, // Correo electrónico
          fullName: result.user.displayName, // Nombre completo
          profilePicture: result.user.photoURL, // Foto de perfil
          createdAt: new Date(), // Fecha de creación
          phoneNumber: result.user.phoneNumber || '', // Número de teléfono (si está disponible)
        };

        console.log('Usuario autenticado con Facebook:', result.user);

        this.registrarUsuario(usuario);
      }
    } catch (error) {
      console.error('Error en la autenticación con Facebook:', error);
      this.errorMessage =
        'Error al iniciar sesión con Facebook. Inténtalo de nuevo.';
    }
  }

  registrarUsuario(usuario: any) {
    this.signInService.signInWithGoogleOrFacebook(usuario).subscribe({
      next: (response) => {
        this.storageService.setToken(response.token);
        const userData = this.sessionService.getUserData();
        this.isLoading = false;

        if (userData) {
          console.log(userData);
          this.userROL = userData.rol;
          let navigateTo = '';
          if (this.userROL === ERol.ADMIN) {
            navigateTo = '/admin/home';
          } else if (this.userROL === ERol.CLIENTE) {
            navigateTo = '/inicio';
          } else if (this.userROL === ERol.TITULAR) {
            navigateTo = '/titular/home';
          }
          console.log(navigateTo);

          // *NUEVO: Guardar la ruta actual antes de navegar*
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('lastVisitedRoute', this.router.url);
          }

          this.router.navigate([navigateTo]).then(() => {
            if (navigateTo === '/inicio') {
              window.location.reload();
            }
            this.inicia();
            // *Considera si realmente necesitas recargar la página completa aquí.*
            // window.location.reload();
          });
        }
      },
      error: (error) => {
        console.error('Error al registrar el usuario:', error);

        if (error.status === 400) {
          this.loginError = 'Error en los datos. Verifica tu cuenta.';
        } else if (error.status === 500) {
          this.loginError = 'Error en el servidor. Intenta más tarde.';
        } else {
          this.loginError = 'Ocurrió un error inesperado.';
        }

        this.cdr.detectChanges();
      },
    });
  }

  // Verifica el estado de bloqueo en localStorage o sessionStorage
  checkLockState() {
    if (isPlatformBrowser(this.platformId)) {
      const lockInfo = localStorage.getItem('lockInfo'); // O sessionStorage.getItem('lockInfo') si prefieres sessionStorage
      if (lockInfo) {
        const { attempts, lockTime, isLocked, remainingTime } =
          JSON.parse(lockInfo);
        this.attempts = attempts;
        this.lockTime = lockTime;
        this.isLocked = isLocked;
        this.remainingTime = remainingTime;

        if (this.isLocked) {
          this.startCountdown(); // Iniciar el temporizador si ya está bloqueado
        }
      }
    }
  }

  // Método para guardar el estado del bloqueo en localStorage o sessionStorage
  saveLockState() {
    const lockInfo = {
      attempts: this.attempts,
      lockTime: this.lockTime,
      isLocked: this.isLocked,
      remainingTime: this.remainingTime,
    };
    localStorage.setItem('lockInfo', JSON.stringify(lockInfo)); // O sessionStorage.setItem si prefieres sessionStorage
  }

  // Método para restablecer el estado del bloqueo
  clearLockState() {
    localStorage.removeItem('lockInfo'); // O sessionStorage.removeItem si prefieres sessionStorage
  }
  // Método para bloquear la cuenta y activar el temporizador
  lockAccount(): void {
    this.isLocked = true;
    this.remainingTime = this.lockTime;

    this.saveLockState(); // Guardar el estado del bloqueo

    // Iniciar un temporizador que decremente cada segundo
    this.startCountdown();
  }

  startCountdown() {
    this.ngZone.run(() => {
      this.timerSubscription = interval(1000).subscribe(() => {
        this.remainingTime--;
        console.log('Tiempo restante:', this.remainingTime); // Verificar en la consola
        this.saveLockState(); // Actualizar el tiempo restante en el almacenamiento

        // Forzar la detección de cambios
        this.cdr.detectChanges();

        if (this.remainingTime <= 0) {
          this.resetLock(); // Desbloquear al finalizar el temporizador
        }
      });
    });
  }
  resetLock(): void {
    this.isLocked = false;
    this.attempts = 0;
    this.clearLockState(); // Eliminar el estado del bloqueo

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe(); // Detener el temporizador
    }
  }

  get hasLowercase(): boolean {
    return /[a-z]/.test(this.loginForm.get('password')?.value);
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.loginForm.get('password')?.value);
  }

  get hasNumber(): boolean {
    return /[0-9]/.test(this.loginForm.get('password')?.value);
  }

  get hasSpecialChar(): boolean {
    return /[@$!%*?&]/.test(this.loginForm.get('password')?.value);
  }

  get hasMinLength(): boolean {
    return this.loginForm.get('password')?.value?.length >= 8;
  }

  redirectTo(route: string): void {
    // Save the current route before navigating
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lastVisitedRoute', this.router.url);
    }
    // this.sidebarVisible = false; // Comentado, ya que no veo estas propiedades en tu clase
    // this.visible = false; // Comentado, ya que no veo estas propiedades en tu clase
    this.router.navigate(
      route.includes('Sign-in') ||
        route.includes('Sign-up') ||
        route.includes('forgot-password') ||
        route.includes('Activar-cuenta')
        ? ['/auth', route]
        : ['/public', route]
    );
  }

  /**
   * Checks if a user session exists (token present and valid)
   * and redirects them to the last visited page or their default page.
   * This should run when the component initializes.
   */
  private checkSessionAndRedirect(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.storageService.getToken();
      if (token) {
        // Here you would ideally validate the token with your backend
        // For simplicity, we'll assume a token presence means a valid session
        // In a real app, you might have a sessionService.isLoggedIn() that checks token validity

        const userData = this.sessionService.getUserData(); // Get user data from decoded token
        if (userData) {
          this.userROL = userData.rol;
          let defaultRedirectRoute = '/inicio'; // Default for CLIENTE

          if (this.userROL === ERol.ADMIN) {
            defaultRedirectRoute = '/admin/home';
          } else if (this.userROL === ERol.TITULAR) {
            defaultRedirectRoute = '/titular/home';
          }

          // Try to get the last visited route
          const lastVisitedRoute = localStorage.getItem('lastVisitedRoute');

          // If a modal is open, we close it
          if (this.isModalVisible) {
            this.close();
          }

          // Redirect to the last visited route or their default role-based route
          this.router.navigate([lastVisitedRoute || defaultRedirectRoute]).then(() => {
            console.log('Sesión reanudada. Redirigiendo a:', lastVisitedRoute || defaultRedirectRoute);
            this.inicia(); // Show loader on redirect
          });
        }
      }
    }
  }
}