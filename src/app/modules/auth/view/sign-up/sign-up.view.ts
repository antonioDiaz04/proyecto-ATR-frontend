import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
// import * AOS
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Usuario } from '../../../../shared/models/usuario.model';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { EventEmitter, Output } from '@angular/core';
// import Swal from 'sweetalert2';

import { UsuarioService } from '../../../../shared/services/usuario.service';
import Swal from 'sweetalert2';
import * as AOS from 'aos';
import { Router } from '@angular/router';
import { mensageservice } from '../../../../shared/services/mensage.service';
import { ToastrModule, Toast, ToastrService } from 'ngx-toastr';
import { isPlatformBrowser } from '@angular/common';
import { interval, map, take } from 'rxjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sign-up-view',
  templateUrl: 'sign-up.view2.html',
  styleUrls: ['./sign-up.view.scss', './listacard.scss'],
})
export class SignUpView implements OnInit, AfterViewInit {
  @Output() nextCallback = new EventEmitter<void>();
  formulario!: FormGroup;
  passwordStrength: string = '';
  strengthColor: string = '';
  coincidenPasswords: boolean = true;
  mostrarPassword: boolean = false;
  ViewActivateAcount: boolean = false;
  datosBasicosForm!: FormGroup;
  frmActivateAcount!: FormGroup;
  politicasForm!: FormGroup;
  datosConfidencialesForm!: FormGroup;
  valid: boolean = false;
  codeValid: boolean = false;
  currentStep: number = 1; // Controla el índice activo del stepper
  public myGlobalVariable: any; // Cambia `any` por el tipo que necesites
  public codigoVerificacion!: number; // Cambia `any` por el tipo que necesites

  validacionesPassword = {
    tieneMinuscula: false,
    tieneMayuscula: false,
    tieneNumero: false,
    longitudMinima: false,
  };
  activeIndex: number = 0;

  errorMessages = {
    username: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  };

  //lo del capchat
  captchaSubscription!: Subscription;
  captchaToken!: string;

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private msgs: mensageservice,

    private fb: FormBuilder,
    private uservice: UsuarioService,
    private toastr: ToastrService,
    //para lo del capchat
    private router: Router
  ) {
    // Inicializar el formulario de datos básicos
    this.datosBasicosForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.required,Validators.pattern(
        // Expresión regular para formato de correo
        /^[a-zA-Z][\w.-]*@[a-zA-Z]+\.[a-zA-Z]{2,}$/
      )],
      telefono: ['', Validators.required],
    });

    // Inicializar el formulario de datos confidenciales
    this.datosConfidencialesForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    });

    // Inicializar el formulario de políticas
    this.politicasForm = this.fb.group({
      acceptTerms: [false, Validators.required], // Valida que el checkbox sea seleccionado
    });

    // Inicializar el formulario OTP
    this.frmActivateAcount = this.fb.group({
      otpCode: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  ngOnInit() {
    // AOS.init();
    this.startCountdown(15 * 60);
    // Validar coincidencia de contraseñas
    this.datosConfidencialesForm
      .get('confirmPassword')
      ?.valueChanges.subscribe(() => {
        this.verificarCoincidencia();
      });

    this.datosBasicosForm.get('username')?.valueChanges.subscribe(() => {
      this.errorMessages.username = '';
    });
    this.datosBasicosForm.get('email')?.valueChanges.subscribe(() => {
      this.errorMessages.email = '';
    });

    this.datosBasicosForm.get('telefono')?.valueChanges.subscribe(() => {
      const numeroTelefono = this.datosBasicosForm.get('telefono')?.value; // Cambié 'tel' a 'telefono'
      this.errorMessages.telefono = ''; // Limpiar mensaje de error inicialmente
      if (numeroTelefono && !isValidPhoneNumber(numeroTelefono, 'MX')) {
        this.errorMessages.telefono = 'Número telefónico inválido.';
      }
    });
  }

  onSignupSubmit() {
    if (this.captchaToken) {
      //verify using backend call
    }
  }
  ngOnDestroy(): void {
    this.captchaSubscription?.unsubscribe();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init({
        duration: 650, // Customize AOS animation duration
        once: true, // Whether animation should happen only once
      });
    }
  }
  togglePasswordVisibility() {
    this.mostrarPassword = !this.mostrarPassword; // Cambia el estado de la visibilidad
  }

  remainingTime: string = '';
  countdownSubscription: Subscription | undefined;

  startCountdown(duration: number) {
    this.countdownSubscription = interval(1000)
      .pipe(
        take(duration + 1),
        map((secondsPassed) => duration - secondsPassed)
      )
      .subscribe(
        (secondsLeft) => {
          this.remainingTime = this.formatTime(secondsLeft);
        },
        null,
        () => {
          this.remainingTime = 'El código ha expirado.';
        }
      );
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }

  // Verificar la fortaleza de la contraseña
  verificarPassword() {
    const password = this.datosConfidencialesForm.get('password')?.value;

    this.validacionesPassword.tieneMinuscula = /[a-z]/.test(password);
    this.validacionesPassword.tieneMayuscula = /[A-Z]/.test(password);
    this.validacionesPassword.tieneNumero = /[0-9]/.test(password);
    this.validacionesPassword.longitudMinima = password.length >= 8;

    // Determina la fuerza de la contraseña
    const validaciones = Object.values(this.validacionesPassword).filter(
      (v) => v
    ).length;

    if (validaciones === 0) {
      this.passwordStrength = 'Muy débil';
      this.strengthColor = 'text-danger';
    } else if (validaciones < 3) {
      this.passwordStrength = 'Débil';
      this.strengthColor = 'text-warning';
    } else if (validaciones === 3) {
      this.passwordStrength = 'Fuerte';
      this.strengthColor = 'text-info';
    } else if (validaciones === 4) {
      this.passwordStrength = 'Muy fuerte';
      this.strengthColor = 'text-success';
    }
  }

  // Verificar coincidencia de contraseñas
  verificarCoincidencia() {
    const password = this.datosConfidencialesForm.get('password')?.value;
    const confirmPassword =
      this.datosConfidencialesForm.get('confirmPassword')?.value;

    this.coincidenPasswords = password === confirmPassword;
  }

  get coincidenPasswords1() {
    return (
      this.datosConfidencialesForm.get('password')?.value ===
      this.datosConfidencialesForm.get('confirmPassword')?.value
    );
  }

  verFrmValidation() {
    const email = this.datosBasicosForm.get('email')?.value;

    this.myGlobalVariable = email;
    this.codeValid = false;
    // this.ViewActivateAcount = true;
  }
  registroDatosBasicos(): void {
    if (this.datosBasicosForm.valid) {
      const email = this.datosBasicosForm.get('email')?.value;
      this.uservice.checkEmailExists(email).subscribe(
        (response) => {
          this.valid = true;
          this.toastr.info(response.message, 'Éxito');

          // this.codigoVerificacion = Math.floor(1000 + Math.random() * 9000); // Código de 4 dígitos
          // console.log(this.codigoVerificacion);

          // console.log(this.codigoVerificacion);
          this.msgs.enviarTokenCorreo(email).subscribe({
            next: (res) => {
              console.log('Código de verificación enviado con éxito:', res);

              // Aquí puedes implementar más lógica si es necesario, como obtener un token de verificación o actualizar el estado de la aplicación
              this.msgs.enviarNotificacion().subscribe({});
              Swal.fire(
                'Verificación',
                'El código de verificación ha sido enviado',
                'info'
              );

              // this.ViewActivateAcount = true;
              // Cambiar el valor de isOtpSent a true para mostrar el segundo formulario
            },
            error: (err) => {
              console.error('Error enviando el código de verificación:', err);
            },
          });
          setTimeout(() => this.nextCallback.emit(), 0); // Solo emite el evento si el correo es válido y el registro es exitoso
        },
        (error) => {
          const errorMessage =
            error.error?.message ||
            'No se pudo verificar el correo electrónico';
          Swal.fire('Error', errorMessage, 'error');
        }
      );
    } else {
      console.log('Datos básicos inválidos');
    }
  }

  registroDatosConfidenciales(): void {
    if (this.datosConfidencialesForm.valid) {
      // Validar que las contraseñas coincidan
      const password = this.datosConfidencialesForm.get('password')?.value;
      const confirmPassword =
        this.datosConfidencialesForm.get('confirmPassword')?.value;

      if (password === confirmPassword) {
        console.log(
          'Datos confidenciales válidos',
          this.datosConfidencialesForm.value
        );
        // Aquí puedes manejar la lógica para avanzar al siguiente paso
      } else {
        console.log('Las contraseñas no coinciden');
      }
    } else {
      console.log('Datos confidenciales inválidos');
    }
  }
  get email() {
    return this.datosBasicosForm.get('email');
  }
  // // Registrar cliente
  registroCliente(): void {
    if (this.politicasForm.invalid) {
      Swal.fire(
        'Registro Invalido',
        'acepte los terminos y condiciones.',
        'error'
      );
    }
    if (
      this.datosBasicosForm.valid &&
      this.datosConfidencialesForm.valid &&
      this.politicasForm.valid
    ) {
      const username = this.datosBasicosForm.get('username')?.value;
      const email = this.datosBasicosForm.get('email')?.value;
      const telefono = this.datosBasicosForm.get('telefono')?.value;
      this.myGlobalVariable = email;
      const password = this.datosConfidencialesForm.get('password')?.value;

      // Crear el objeto USUARIO accediendo campo por campo
      const USUARIO = {
        nombre: username,
        email: email,
        telefono: telefono,
        password: password,
      };

      // Llama al servicio de registro, asumiendo que tienes un servicio de usuario
      this.uservice.register(USUARIO).subscribe(
        (response) => {
          // Swal.fire('Exitoso', 'El registro fue exitoso', 'success');
          this.datosBasicosForm.reset(); // Resetea el formulario de datos básicos
          this.datosConfidencialesForm.reset(); // Resetea el formulario de datos confidenciales
          this.politicasForm.reset(); // Resetea el formulario de políticas

          Swal.fire(
            'Bienvenido a la tienda en linea de ATELIER',
            'Se ha registrado tu cuenta, ya puedes continuar.',
            'info'
          ).then(() => {
            // Redirigir al login después de cerrar el modal de SweetAlert
            this.router.navigate(['/inicio']);
          });
        },
        (error) => {
          console.error(error);
          this.resetErrorMessages(); // Limpia mensajes de error antes de asignar nuevos

          // Extract the error message from the response (adjust as per your backend structure)
          const errorMessage =
            error.error?.message || 'An unknown error occurred';

          // Display the backend error message using Toastr
          this.toastr.error(errorMessage, 'Error');
          // Maneja errores específicos
          if (error.status === 400) {
            this.errorMessages.username = error.error.message.includes(
              'usuario'
            )
              ? error.error.message
              : '';
            this.errorMessages.email = error.error.message.includes('email')
              ? error.error.message
              : '';
            this.errorMessages.telefono = error.error.message.includes(
              'telefono'
            )
              ? error.error.message
              : '';
          } else {
            this.errorMessages.username =
              'Ocurrió un error, por favor intenta nuevamente.';
          }
        }
      );
    } else {
      // Llama a una función para validar los campos de los formularios
      this.validateFormFields();
    }
  }

  // // Validar campos del formulario
  validateFormFields() {
    if (this.datosBasicosForm.get('username')?.invalid) {
      this.errorMessages.username = 'El nombre de usuario es requerido.';
    }
    if (this.datosBasicosForm.get('email')?.invalid) {
      this.errorMessages.email = 'El correo electrónico debe ser válido.';
    }
    if (this.datosBasicosForm.get('telefono')?.invalid) {
      this.errorMessages.telefono =
        'El número telefónico es requerido y debe ser válido.';
    }
    if (this.datosConfidencialesForm.get('password')?.invalid) {
      this.errorMessages.password = 'La contraseña es requerida.';
    }
    if (this.datosConfidencialesForm.get('confirmPassword')?.invalid) {
      this.errorMessages.confirmPassword = 'Por favor confirma tu contraseña.';
    }
  }

  // Restablecer mensajes de error
  resetErrorMessages() {
    this.errorMessages = {
      username: '',
      email: '',
      telefono: '',
      password: '',
      confirmPassword: '',
    };
  }
  active: number = 0; // Index of the current step

  // Steps data for the p-steps component
  items: any[] = [
    { label: 'Step 1', command: () => this.goToStep(0) },
    { label: 'Step 2', command: () => this.goToStep(1) },
    { label: 'Step 3', command: () => this.goToStep(2) },
  ];

  goToStep(index: number) {
    this.active = index; // Update the active step index
  }

  verifyOtp(): void {
    // this.codeValid = true;
    const enteredCode = Number(this.frmActivateAcount.get('otpCode')?.value); // Convertir a número
    console.log('Ingresado:', enteredCode, 'Tipo:', typeof enteredCode);
    console.log(
      'Origin:',
      this.codigoVerificacion,
      'Tipo:',
      typeof this.codigoVerificacion
    );

    if (enteredCode === this.codigoVerificacion) {
      Swal.fire('Éxito', 'El código de verificación es correcto', 'success');
      // Procede a la siguiente vista
      // this.nextCallback.emit();
      // this.ViewActivateAcount = false;
      this.codeValid = true;

      // Aquí puedes cambiar el paso del stepper si tienes una referencia a él
    } else {
      Swal.fire('Error', 'El código de verificación es incorrecto', 'error');
    }
  }
}
