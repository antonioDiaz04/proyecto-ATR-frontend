import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { mensageservice } from '../../../../shared/services/mensage.service';
import { UsuarioService } from '../../../../shared/services/usuario.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recuperar-by-email',
  templateUrl: './recuperar-by-email.component.html',
  // styleUrls: ['./recuperar-by-email.component.scss']
})
export class RecuperarByEmailComponent implements OnInit {
  @Output() regresar = new EventEmitter<void>();

  isLoading = false;

  frmSeleccionMetodoRecuperacion: FormGroup;
  frmbuscarCorreo: FormGroup;
  frmVerificacion: FormGroup;
  // frmPregunta: FormGroup;
  frmActualizaPassword: FormGroup;

  faltantes: string[] = [];
  passwordStrengthMessage = '';
  passwordStrength = '';
  strengthColor = '';
  value?: string;
  correoIngresado = '';
  formularioEnviado = false;
  coincidenPasswords = true;

  esFrmCorreo = true;
  esFrmWhatsapp = false;
  esFrmPregunta = false;
  esfrmVerificacion = false;
  esFrmResetPassword = false;

  inputControl = new FormControl('');
 codigo:any;
  validacionesPassword = {
    tieneMinuscula: false,
    tieneMayuscula: false,
    tieneNumero: false,
    tieneSimbolo: false,
    longitudMinima: false,
    longitudMayor5: false,
    tiene5CaracteresDiferentes: false,
  };

  constructor(
    public msg: mensageservice,
    private router: Router,
    private usuarioService: UsuarioService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService
  ) {
    this.frmSeleccionMetodoRecuperacion = this.formBuilder.group({
      opcion: new FormControl('pregunta'),
    });

    this.frmbuscarCorreo = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.frmVerificacion = this.formBuilder.group({
  otp0: ['', [Validators.required, Validators.pattern('[0-9]')]],
  otp1: ['', [Validators.required, Validators.pattern('[0-9]')]],
  otp2: ['', [Validators.required, Validators.pattern('[0-9]')]],
  otp3: ['', [Validators.required, Validators.pattern('[0-9]')]]
});

    // this.frmPregunta = this.formBuilder.group({
    //   pregunta: ['', Validators.required],
    //   respuesta: ['', Validators.required],
    // });

    this.frmActualizaPassword = this.formBuilder.group({
      nueva: ['', Validators.required],
      confirma: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  verificarPassword(): void {
    const password = this.frmActualizaPassword.get('nueva')?.value || '';
    const mayusculas = (password.match(/[A-Z]/g) || []).length;
    const minusculas = (password.match(/[a-z]/g) || []).length;
    const numeros = (password.match(/[0-9]/g) || []).length;
    const especiales = (password.match(/[!@#$&*]/g) || []).length;

    const mayusculasFaltantes = Math.max(3 - mayusculas, 0);
    const minusculasFaltantes = Math.max(4 - minusculas, 0);
    const numerosFaltantes = Math.max(4 - numeros, 0);
    const especialesFaltantes = Math.max(5 - especiales, 0);
    const longitudFaltante = Math.max(16 - password.length, 0);

    this.faltantes = [];
    if (longitudFaltante > 0) this.faltantes.push(`${longitudFaltante} caracteres más`);
    if (mayusculasFaltantes > 0) this.faltantes.push(`${mayusculasFaltantes} letras mayúsculas`);
    if (minusculasFaltantes > 0) this.faltantes.push(`${minusculasFaltantes} letras minúsculas`);
    if (numerosFaltantes > 0) this.faltantes.push(`${numerosFaltantes} números`);
    if (especialesFaltantes > 0) this.faltantes.push(`${especialesFaltantes} caracteres especiales`);

    this.passwordStrengthMessage = this.faltantes.length === 0
      ? 'Contraseña válida con el formato adecuado'
      : `Formato incompleto. Faltan: ${this.faltantes.join(', ')}`;
  }

  verificarCoincidencia(): void {
    const nueva = this.frmActualizaPassword.get('nueva')?.value;
    const confirma = this.frmActualizaPassword.get('confirma')?.value;
    this.coincidenPasswords = nueva === confirma;
  }

  msgErrorMessage: string = ''; // Para almacenar el mensaje de error del correo

  enviarYbuscarCorreo(): void {
    this.isLoading = true;
    this.msgErrorMessage = '';
    const email = this.frmbuscarCorreo.get('email')?.value;

    this.usuarioService.enviarCodido(email).subscribe(
      (response) => {
        this.isLoading = false;
        if (response) {
          // this.toastr.info('Revisa tu bandeja de correos.', 'Envío');
          this.esFrmCorreo = false;
          this.esfrmVerificacion = true;
          this.msg.enviarNotificacion().subscribe();
        } else {
          this.msgErrorMessage = 'El correo no fue encontrado';
        }
      },
      (error) => {
        this.isLoading = false;
        this.msgErrorMessage = 'No se encontró el correo';
        console.error('No se encontró el correo:', error);
      }
    );
  }

  otpErrorMessage: string = ''; // Para almacenar el mensaje de error del OTP

  verificarCodigo() {
    this.esFrmCorreo = false;
    this.isLoading = true;

    const email = this.frmbuscarCorreo.get('email')?.value;
    const otpCode = `${this.frmVerificacion.value.otp0}${this.frmVerificacion.value.otp1}${this.frmVerificacion.value.otp2}${this.frmVerificacion.value.otp3}`;

    if (!otpCode) {
      this.otpErrorMessage = 'Ingrese el código';
      this.isLoading = false;
      return;
    }

    this.usuarioService.enviarToken(email, otpCode).subscribe({
      next: (response) => {
      this.isLoading = false;
      if (response) {
        this.otpErrorMessage = '';
        this.esfrmVerificacion = false;
        this.esFrmResetPassword = true;
      } else {
        this.otpErrorMessage = 'Código incorrecto';
        this.esFrmCorreo = false;
        this.esfrmVerificacion = true;
      }
      },
      error: (error) => {
      this.isLoading = false;
      let mensaje = 'El código es incorrecto';
      if (error && error.error && error.error.mensaje) {
        mensaje = error.error.mensaje;
      }
      this.otpErrorMessage = mensaje;
      console.error('El código es incorrecto:', error);
      }
    });
       
  }
  actualizarPasswordxCorreo(): void {
    const email = this.frmbuscarCorreo.value.email;
    const nueva = this.frmActualizaPassword.get('nueva')?.value;
    const confirma = this.frmActualizaPassword.get('confirma')?.value;

    if (typeof nueva !== 'string' || typeof confirma !== 'string') {
      Swal.fire('Error', 'Las contraseñas no son válidas', 'error');
      return;
    }

    if (nueva !== confirma) {
      Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
      return;
    }

    this.usuarioService.actualizaPasswordxCorreo(email, nueva).subscribe(
      (response) => {
        if (response) {
          Swal.fire('¡Operación exitosa!', 'Se actualizó tu contraseña', 'success');
          this.router.navigate(['/public/inicio']);
        } else {
          this.toastr.error('Los datos no fueron encontrados', 'Error');
        }
      },
      (error) => {
        console.error('No se encontraron coincidencias:', error);
        this.toastr.error('Error al actualizar la contraseña', 'Error');
      }
    );
  }

  regresarOpciones(): void {
    this.regresar.emit();
  }

  regresarCorreo(): void {
    this.esFrmCorreo = true;
    this.esfrmVerificacion = false;
  }

  regresarVerificacion(): void {
    this.esfrmVerificacion = true;
    this.esFrmResetPassword = false;
  }
   handleOtpInput(index: number, event: any): void {
  const input = event.target;
  if (input.value.length === 1) {
    const nextInput = input.nextElementSibling;
    if (nextInput) {
      nextInput.focus();
    }
  }
}
}
