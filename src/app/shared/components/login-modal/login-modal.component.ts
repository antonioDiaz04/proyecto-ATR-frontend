import { ChangeDetectorRef, Component, ElementRef, Inject, Output, PLATFORM_ID, Renderer2, EventEmitter, Input, OnInit, SimpleChanges, OnDestroy, AfterViewInit, ViewChild, NgZone, inject, OnChanges } from '@angular/core';
import { IndexedDbService } from '../../../modules/public/commons/services/indexed-db.service';
import { mensageservice } from '../../services/mensage.service';
import { StorageService } from '../../services/storage.service';
import { SignInService } from '../../../modules/auth/commons/services/sign-in.service';
import { SessionService } from '../../services/session.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DatosEmpresaService } from '../../services/datos-empresa.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ThemeServiceService } from '../../services/theme-service.service';
import { Router } from '@angular/router';
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
import { NgxScannerQrcodeService, ScannerQRCodeConfig } from 'ngx-scanner-qrcode';
import { QRScannerComponent } from '../../../modules/auth/qr-scanner/qr-scanner.component';
import { DialogService, DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Auth, signInWithPopup, FacebookAuthProvider, GoogleAuthProvider } from '@angular/fire/auth';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [
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
    HttpClientModule
  ],
  providers: [DialogService],
  templateUrl: './login-modal.component.html',
})
export class LoginModalComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  // Propiedades existentes
  isLoading = false;
  userROL!: string;
  count!: number;
  captchaToken: string | null = null;
  auth: Auth = inject(Auth);
  maxAttempts: number = 5;
  attempts: number = 0;
  isLocked: boolean = false;
  lockTime: number = 30;
  remainingTime: number = 0;
  timerSubscription!: Subscription;
  loginForm: FormGroup;
  isGoogleLogin = false;
  errorMessage: string = '';
  loginError: string = '';
  loading: boolean = false;
  captchagenerado: boolean = false;
  logo!: string;
  nombreEmpresa: string = 'Atelier';
  visible: boolean = false;
  passwordStrengthClass: string = '';
  passwordStrengthMessage: string = '';
  captcha = '';
  faltantes: string[] = [];
  showPassword: boolean = false;
  border: any;
  
  // Propiedades nuevas para QR
  private qrScannerRef?: DynamicDialogRef;


  // Inputs/Outputs
  @Input() isModalVisible: boolean = false;
  @Output() closed: EventEmitter<string> = new EventEmitter<string>();
  @Output() mostrarFormulario = new EventEmitter<boolean>();
  @ViewChild('passwordField') passwordField!: ElementRef;

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
    private elementRef: ElementRef,
    public themeService: ThemeServiceService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private qrScannerService: NgxScannerQrcodeService,
    public dialogService: DialogService
  ) {
    this.loginForm = this.fb.group(
      {
        email: ['', [Validators.pattern(/^[\w.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
        telefono: ['', [Validators.pattern(/^[0-9]{10}$/)]],
        password: ['', Validators.required],
        captcha: ['', Validators.required],
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
      duration: 650,
      once: true,
    });
    this.getCaptchaToken();
    this.loadCaptchaScript();
    this.loginForm.valueChanges.subscribe(() => {
      this.loginForm.markAllAsTouched();
    });
    this.checkSessionAndRedirect();
  }

  toggleValidation() {
    if (this.usePhoneLogin) {
      this.loginForm.get('email')?.clearValidators();
      this.loginForm.get('telefono')?.setValidators([Validators.required, Validators.pattern('^[0-9]{10}$')]);
    } else {
      this.loginForm.get('telefono')?.clearValidators();
      this.loginForm.get('email')?.setValidators([Validators.required, Validators.pattern(/^[\w.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]);
    }
    this.loginForm.get('email')?.updateValueAndValidity();
    this.loginForm.get('telefono')?.updateValueAndValidity();
  }

  ngAfterViewInit() {
    this.cargarWidgetRecaptcha();
    this.passwordField.nativeElement.setAttribute('autocomplete', 'current-password');
    if (typeof grecaptcha !== 'undefined' && 'ready' in grecaptcha) {
      grecaptcha.ready(() => {
        grecaptcha.render('captcha-container', {
          sitekey: '6Ld8joAqAAAAABuc_VUhgDt7bzSOYAr7whD6WeNI',
          callback: (token: string) => {
            this.validateCaptcha();
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
          this.getCaptchaToken();
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
    this.qrScannerRef?.close();
  }

  usePhoneLogin: boolean = false;

  toggleLoginMethod() {
    this.usePhoneLogin = !this.usePhoneLogin;
    this.loginForm.get('email')?.reset();
    this.loginForm.get('telefono')?.reset();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isModalVisible']) {
      console.log('Estado del modal cambiado:', changes['isModalVisible'].currentValue);
    }
  }

  close(): void {
    this.mostrarFormulario.emit(false);
    this.closed.emit('Modal cerrado correctamente');
  }

  getCaptchaToken(): string {
    if (typeof grecaptcha !== 'undefined') {
      const token = grecaptcha.getResponse();
      if (!token) {
        console.warn('Token no generado todavía.');
        this.loginForm.get('captcha')?.setValue('');
      } else {
        this.loginForm.get('captcha')?.setValue(token);
      }
      return token;
    } else {
      console.error('reCAPTCHA no ha sido cargado.');
      return '';
    }
  }

  loadCaptchaScript() {
    if (typeof document === 'undefined') {
      console.warn('No se puede cargar el script porque document no está definido.');
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
        this.cargarWidgetRecaptcha();
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
      this.loginForm.get('captcha')?.setValue(token);
      this.loginForm.get('captcha')?.markAsUntouched();
      return token;
    } else {
      this.loginForm.get('captcha')?.setValue('');
      return null;
    }
  }

  inicia() {
    this.ngxService.start();
    setTimeout(() => {
      this.ngxService.stop();
    }, 3000);
    this.ngxService.startBackground('do-background-things');
    this.ngxService.stopBackground('do-background-things');
    this.ngxService.startLoader('loader-01');
    setTimeout(() => {
      this.ngxService.stopLoader('loader-01');
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
    this.passwordIncorrecta = this.faltantes.length === 0 && password.length > 0;
  }

  login(): void {
    this.loginForm.markAllAsTouched();
    this.errorMessage = '';
    this.loginError = '';
    this.captchaToken = this.loginForm.get('captcha')?.value;
    this.isLoading = true;
    this.toggleValidation();
    if (this.isLocked) {
      this.loginError = `Has alcanzado el límite de intentos. Intenta de nuevo en ${this.remainingTime} segundos.`;
      this.isLoading = false;
      return;
    }
    if (!navigator.onLine) {
      this.loginError = 'Por favor, verifica tu conexión y vuelve a intentarlo.';
      this.isLoading = false;
      return;
    }

    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    const telefono = this.loginForm.value.telefono;

    this.signInService.signIn({ email, password, telefono, captchaToken: this.captchaToken }).subscribe(
      (response) => {
        if (response) {
          this.storageService.setToken(response.token);
          const userData = this.sessionService.getUserData();
          this.isLoading = false;
          if (userData) {
            this.userROL = userData.rol;
            let navigateTo = '';
            if (this.userROL === ERol.ADMIN) {
              navigateTo = '/admin/home';
            } else if (this.userROL === ERol.CLIENTE) {
              navigateTo = '/inicio';
            } else if (this.userROL === ERol.TITULAR) {
              navigateTo = '/titular/home';
            }
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('lastVisitedRoute', this.router.url);
            }
            this.close();
            this.router.navigate([navigateTo]).then(() => {
              if (navigateTo === '/inicio') {
                window.location.reload();
              }
              this.inicia();
            });
          }
        }
      },
      (err) => {
        console.error('Error en el inicio de sesión:', err);
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.';
        } else if (err.status === 403) {
          this.loginError = err.error.message;
          this.attempts = err.error.numeroDeIntentos;
          this.lockTime = parseInt(err.error.tiempo, 10);
          this.lockAccount();
        } else if (err.status === 400 && err.error.message === 'Captcha inválido') {
          this.loginError = 'Captcha inválido. Por favor, inténtalo de nuevo.';
          if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
          }
        } else if (err.status === 0) {
          this.loginError = 'Error de conexión. Por favor, verifica tu conexión a internet o intenta más tarde.';
        } else {
          this.loginError = 'Ha ocurrido un error al iniciar sesión.';
        }
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
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: new Date(),
          phoneNumber: result.user.phoneNumber || '',
        };
        this.registrarUsuario(usuario);
      }
    } catch (error) {
      console.error('Error en la autenticación:', error);
    }
  }

  async loginWithFacebook() {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      this.loginForm.reset();
      if (result.user) {
        const usuario = {
          uid: result.user.uid,
          email: result.user.email,
          fullName: result.user.displayName,
          profilePicture: result.user.photoURL,
          createdAt: new Date(),
          phoneNumber: result.user.phoneNumber || '',
        };
        this.registrarUsuario(usuario);
      }
    } catch (error) {
      console.error('Error en la autenticación con Facebook:', error);
      this.errorMessage = 'Error al iniciar sesión con Facebook. Inténtalo de nuevo.';
    }
  }

  // ==================== FUNCIONES QR NUEVAS ====================

  loginWithQR(): void {
    if (this.isLoading) return;
    
    // Verificar soporte de cámara
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      Swal.fire({
        icon: 'warning',
        title: 'Cámara no soportada',
        text: 'Tu dispositivo no soporta el acceso a la cámara',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000
      });
      return;
    }

    // Abrir modal con el escáner
    this.qrScannerRef = this.dialogService.open(QRScannerComponent, {
      header: 'Iniciar sesión con QR',
      width: '90vw',
      modal: true,
      closable: true,
      data: {},
      styleClass: 'qr-scanner-dialog'
    } as DynamicDialogConfig);

    // Suscribirse al resultado del escaneo
    this.qrScannerRef.onClose.subscribe((qrData: string) => {
      if (qrData) {
        this.processQRData(qrData);
      }
    });
  }

  private processQRData(qrData: string): void {
    this.isLoading = true;
    
    try {
      const parsedData = JSON.parse(qrData);
      
      if (!parsedData.token) {
        throw new Error('QR inválido: no contiene token de autenticación');
      }

      // Llamar al backend para validar el token QR
      this.signInService.loginWithQRToken(parsedData.token).subscribe({
        next: (response: any) => {
          this.handleSuccessfulLogin(response);
        },
        error: (error: any) => {
          this.handleQRLoginError(error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });

    } catch (error) {
      this.handleQRLoginError('El código QR escaneado no es válido');
      this.isLoading = false;
    }
  }

  private handleSuccessfulLogin(response: any): void {
    // Guardar token y datos del usuario
    this.storageService.setToken(response.token);
    const userData = this.sessionService.getUserData();
    
    if (userData) {
      this.userROL = userData.rol;
      let navigateTo = '';
      
      switch(this.userROL) {
        case ERol.ADMIN:
          navigateTo = '/admin/home';
          break;
        case ERol.CLIENTE:
          navigateTo = '/inicio';
          break;
        case ERol.TITULAR:
          navigateTo = '/titular/home';
          break;
        default:
          navigateTo = '/inicio';
      }

      // Guardar última ruta visitada
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('lastVisitedRoute', this.router.url);
      }

      // Cerrar modal de login
      this.close();

      // Navegar y mostrar loader
      this.router.navigate([navigateTo]).then(() => {
        if (navigateTo === '/inicio') {
          window.location.reload();
        }
        this.inicia();
      });
    }
  }

  private handleQRLoginError(error: any): void {
    let errorMessage = 'Error al iniciar sesión con QR';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.status === 401) {
      errorMessage = 'Token QR inválido o expirado';
    } else if (error?.status === 403) {
      errorMessage = 'Este QR ya ha sido utilizado';
    } else if (error?.status === 0) {
      errorMessage = 'Error de conexión. Verifica tu internet';
    }

    // Mostrar error con SweetAlert2
    Swal.fire({
      icon: 'error',
      title: 'Error de login',
      text: errorMessage,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000
    });

    // Limpiar el recaptcha si es necesario
    if (typeof grecaptcha !== 'undefined') {
      grecaptcha.reset();
    }
  }

  // ==================== FIN FUNCIONES QR ====================

  registrarUsuario(usuario: any) {
    this.signInService.signInWithGoogleOrFacebook(usuario).subscribe({
      next: (response) => {
        this.storageService.setToken(response.token);
        const userData = this.sessionService.getUserData();
        this.isLoading = false;
        if (userData) {
          this.userROL = userData.rol;
          let navigateTo = '';
          if (this.userROL === ERol.ADMIN) {
            navigateTo = '/admin/home';
          } else if (this.userROL === ERol.CLIENTE) {
            navigateTo = '/inicio';
          } else if (this.userROL === ERol.TITULAR) {
            navigateTo = '/titular/home';
          }
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('lastVisitedRoute', this.router.url);
          }
          this.router.navigate([navigateTo]).then(() => {
            if (navigateTo === '/inicio') {
              window.location.reload();
            }
            this.inicia();
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

  checkLockState() {
    if (isPlatformBrowser(this.platformId)) {
      const lockInfo = localStorage.getItem('lockInfo');
      if (lockInfo) {
        const { attempts, lockTime, isLocked, remainingTime } = JSON.parse(lockInfo);
        this.attempts = attempts;
        this.lockTime = lockTime;
        this.isLocked = isLocked;
        this.remainingTime = remainingTime;
        if (this.isLocked) {
          this.startCountdown();
        }
      }
    }
  }

  saveLockState() {
    const lockInfo = {
      attempts: this.attempts,
      lockTime: this.lockTime,
      isLocked: this.isLocked,
      remainingTime: this.remainingTime,
    };
    localStorage.setItem('lockInfo', JSON.stringify(lockInfo));
  }

  clearLockState() {
    localStorage.removeItem('lockInfo');
  }

  lockAccount(): void {
    this.isLocked = true;
    this.remainingTime = this.lockTime;
    this.saveLockState();
    this.startCountdown();
  }

  startCountdown() {
    this.ngZone.run(() => {
      this.timerSubscription = interval(1000).subscribe(() => {
        this.remainingTime--;
        console.log('Tiempo restante:', this.remainingTime);
        this.saveLockState();
        this.cdr.detectChanges();
        if (this.remainingTime <= 0) {
          this.resetLock();
        }
      });
    });
  }

  resetLock(): void {
    this.isLocked = false;
    this.attempts = 0;
    this.clearLockState();
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
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
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lastVisitedRoute', this.router.url);
    }
    this.router.navigate(
      route.includes('Sign-in') || route.includes('Sign-up') || route.includes('forgot-password') || route.includes('Activar-cuenta')
        ? ['/auth', route]
        : ['/public', route]
    );
  }

  private checkSessionAndRedirect(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.storageService.getToken();
      if (token) {
        const userData = this.sessionService.getUserData();
        if (userData) {
          this.userROL = userData.rol;
          let defaultRedirectRoute = '/inicio';
          if (this.userROL === ERol.ADMIN) {
            defaultRedirectRoute = '/admin/home';
          } else if (this.userROL === ERol.TITULAR) {
            defaultRedirectRoute = '/titular/home';
          }
          const lastVisitedRoute = localStorage.getItem('lastVisitedRoute');
          if (this.isModalVisible) {
            this.close();
          }
          this.router.navigate([lastVisitedRoute || defaultRedirectRoute]).then(() => {
            console.log('Sesión reanudada. Redirigiendo a:', lastVisitedRoute || defaultRedirectRoute);
            this.inicia();
          });
        }
      }
    }
  }
}