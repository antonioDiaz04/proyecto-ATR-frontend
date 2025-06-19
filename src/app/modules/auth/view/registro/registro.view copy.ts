import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { mensageservice } from '../../../../shared/services/mensage.service';
import { SessionService } from '../../../../shared/services/session.service';
import { UsuarioService } from '../../../../shared/services/usuario.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import {
  parsePhoneNumberFromString,
  isValidPhoneNumber,
} from 'libphonenumber-js';
import axios from 'axios';
import { Location } from '@angular/common';

declare const $: any;

@Component({
  selector: 'app-registro',
  templateUrl: './registro.view.html',
})
export class RegistroView {
  currentStep = 1;
  passwordStrengthClass: string = '';
  passwordStrengthMessage: string = '';
  faltantes: string[] = [];
  verificationCode: string = '';
  remainingChars: number = 15;
  emailError: string | null = null;
  passwordStrength: string = '';
  personalDataForm: FormGroup;
  credentialsForm: FormGroup;
  otpForm: FormGroup;
  otpWhatsappForm: FormGroup;
  displayModal: boolean = false;
  isLoadingBasic: boolean = false;
  displayCode: boolean = false;
  displayGmailModal: boolean = false;
  displaySmsModal: boolean = false;
  displayWhatsappModal: boolean = false;
  tokenRespuesta: string | null = null;
  isLoading = false;
  detectedCountry: string | null = null;
  isPasswordCompromised: boolean = false;
  errorMessage: string | null = null; // Para almacenar el mensaje de error

  showSpinner() {
    this.isLoading = true;
    $('.ui.segment').modal('show');

    setTimeout(() => {
      this.hideSpinner();
    }, 3000);
  }

  get email() {
    return this.personalDataForm.get('email');
  }

  hideSpinner() {
    this.isLoading = false;
    $('.ui.segment').modal('hide');
  }

  constructor(
    private location: Location,
    private router: Router,
    private msgs: mensageservice,
    private fb: FormBuilder,
    private uservice: UsuarioService,
    private sessionService_: SessionService,
    private mensageservice_: mensageservice,
    private toastr: ToastrService,
    private ngxService: NgxUiLoaderService
  ) {
    this.personalDataForm = this.fb.group({
      username: ['', [Validators.required]],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          this.emailValidator(),
        ],
      ],
      telefono: ['', [Validators.required, this.telefonoValidator]],
    });

    this.credentialsForm = this.fb.group({
      password: ['', [Validators.required, this.passwordValidator()]],
      confirmPassword: ['', Validators.required],
    });

    this.otpForm = this.fb.group({
      otpCode: [
        '',
        [Validators.required, Validators.minLength(4), Validators.maxLength(4)],
      ],
    });

    this.otpWhatsappForm = this.fb.group({
      otpCode: [
        '',
        [Validators.required, Validators.minLength(4), Validators.maxLength(4)],
      ],
    });
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      const regex =
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (regex.test(password)) {
        return null;
      } else {
        return {
          invalidPassword: 'La contraseña no cumple con los requisitos.',
        };
      }
    };
  }

  get isFormValid(): boolean {
    return this.personalDataForm.valid;
  }

  telefonoValidator(control: AbstractControl) {
    const phoneNumber = control.value;
    const parsedNumber = parsePhoneNumberFromString(phoneNumber);

    if (parsedNumber && isValidPhoneNumber(phoneNumber)) {
      return null;
    }
    return { invalidPhone: true };
  }

  emailValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const emailRegex =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|io|info|biz|mx|us|uk|es|fr|de|ca|au|jp|xyz|me|tech|co|tv|cloud|ai)$/;

      const valid = emailRegex.test(control.value);
      return valid ? null : { invalidEmail: true };
    };
  }

  updateRemainingChars() {
    const usernameValue = this.personalDataForm.get('username')?.value || '';
    this.remainingChars = 8 - usernameValue.length;
  }

  goToNextStep() {
    this.personalDataForm.get('otpCode')?.reset();
    setTimeout(() => {
      this.ngxService.stop();
    }, 5000);

    this.showSpinner();
    const username = this.personalDataForm.get('username')?.value;
    const email = this.personalDataForm.get('email')?.value;
    const telefono = this.personalDataForm.get('telefono')?.value;
    this.errorMessage = null; // Resetear el mensaje de error

    if (!username) {
      this.errorMessage = 'El username es obligatorio';
      return;
    }
    if (!email) {
      this.errorMessage = 'El correo es obligatorio';
      return;
    }
    if (!telefono) {
      this.errorMessage = 'El telefono es obligatorio';
      return;
    }

    this.uservice.checkEmailExists(email).subscribe({
      next: () => {
        this.isLoadingBasic = false;
        this.currentStep = 1.5;
        this.resendCodeGmail();
      },
      error: () => {
        this.errorMessage = 'El email ya está registrado';
        this.hideSpinner();
      },
    });

    this.uservice.checkTelefonoExists(telefono).subscribe({
      next: () => {
        this.isLoadingBasic = false;
        this.displayModal = true;
      },
      error: () => {
        this.isLoadingBasic = false;
        this.displayModal = false;
        this.errorMessage = 'El telefono ya está registrado';
        this.hideSpinner();
      },
    });
  }

  otpDigits: string[] = ['', '', '', ''];
  otpInvalido = false;

  handleOtpInput(index: number): void {
    if (this.otpDigits[index].length > 1) {
      this.otpDigits[index] = this.otpDigits[index][0];
    }
  }
  otpErrorMessage: string = ''; // Para almacenar el mensaje de error del OTP

  verificarOTP(): void {
    console.log('Iniciando verificación de OTP...');
    this.showSpinner();
    this.otpErrorMessage = ''; // Limpiar mensaje de error al iniciar la verificación

    if (this.otpForm.valid) {
      const otpCode = this.otpDigits.join(''); // Obtener el código OTP ingresado
      const tokenRespuesta = this.tokenRespuesta; // Este token debería haberse obtenido al enviar el código

      console.log('otpCode ingresado:', otpCode);
      console.log('tokenRespuesta:', tokenRespuesta);
      if (tokenRespuesta) {
        // Decodificar y validar el token
        const decodedData = this.sessionService_.getUserTokenDecode(
          tokenRespuesta,
          otpCode
        );
        console.log('Resultado de decodificación:', decodedData);

        if (decodedData) {
          this.hideSpinner();
          console.log('Código OTP verificado correctamente.');
          this.currentStep = 2; // Avanzar al siguiente paso
          this.displayGmailModal = false;
        } else {
          this.hideSpinner();
          this.otpErrorMessage = 'El código de verificación es incorrecto.'; // Establecer mensaje de error
          console.log('El código de verificación es incorrecto.');
        }
      } else {
        this.hideSpinner();
        this.otpErrorMessage = 'No se pudo validar el código de verificación.'; // Establecer mensaje de error
        console.log('No se pudo validar el código de verificación.');
      }
    } else {
      this.hideSpinner();
      this.otpErrorMessage = 'Por favor ingrese un código válido.'; // Establecer mensaje de error
      console.log('Formulario OTP inválido.');
    }
  }
  }
  getInvalidControls() {
    const invalidControls: {
      controlName: string;
      errors: ValidationErrors | null;
    }[] = [];

    Object.keys(this.personalDataForm.controls).forEach((controlName) => {
      const control = this.personalDataForm.get(controlName);
      if (control && control.invalid) {
        invalidControls.push({ controlName, errors: control.errors });
      }
    });

    return invalidControls;
  }

  getErrorMessages(errors: ValidationErrors | null): string {
    const messages: string[] = [];

    if (errors?.['required']) {
      messages.push('El campo es obligatorio.');
    }
    if (errors?.['maxlength']) {
      messages.push(`El campo excede la longitud máxima permitida.`);
    }
    if (errors?.['pattern']) {
      messages.push(`El formato ingresado no es válido.`);
    }

    return messages.join(' ');
  }

  goToPreviousStep() {
    this.currentStep = 1;
  }

  onSubmit() {
    if (this.credentialsForm.valid) {
      console.log('Formulario enviado:', {
        ...this.personalDataForm.value,
        ...this.credentialsForm.value,
      });
    }
  }

  coincidenPasswords = false;

  verificarCoincidencia() {
    const password = this.credentialsForm.get('password')?.value;
    const confirmPassword = this.credentialsForm.get('confirmPassword')?.value;
    this.coincidenPasswords = password === confirmPassword;

    if (!this.coincidenPasswords) {
      this.credentialsForm.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      this.credentialsForm.get('confirmPassword')?.setErrors(null);
    }
  }

  verificarPassword() {
    const password = this.credentialsForm.get('password')?.value || '';
    this.faltantes = [];

    if (!/[A-Z]/.test(password)) {
      this.faltantes.push('Al menos una letra mayúscula.');
    }
    if (!/[a-z]/.test(password)) {
      this.faltantes.push('Al menos una letra minúscula.');
    }
    if (!/\d/.test(password)) {
      this.faltantes.push('Al menos un dígito.');
    }
    if (!/[@$!%*?&]/.test(password)) {
      this.faltantes.push('Al menos un carácter especial (@$!%*?&).');
    }
    if (password.length < 8) {
      this.faltantes.push('Al menos 8 caracteres.');
    }

    if (this.faltantes.length > 0) {
      this.credentialsForm.get('password')?.setErrors({ invalidPassword: true });
    } else {
      this.credentialsForm.get('password')?.setErrors(null);
    }
  }

  volver() {
    this.location.back();
  }

  registroCliente(): void {
    if (this.personalDataForm.valid && this.credentialsForm.valid) {
      const username = this.personalDataForm.get('username')?.value;
      const email = this.personalDataForm.get('email')?.value;
      const telefono = this.personalDataForm.get('telefono')?.value;
      const password = this.credentialsForm.get('password')?.value;

      const USUARIO = {
        nombre: username,
        email: email,
        telefono: telefono,
        password: password,
      };

      this.showSpinner();
      console.log(USUARIO);
      this.uservice.register(USUARIO).subscribe(
        (response) => {
          console.log('Response:', response);
          this.hideSpinner();
          this.router.navigate(['/inicio']);
        },
        (error) => {
          console.error(error);
          const errorMessage =
            error.error?.message || 'An unknown error occurred';
          this.toastr.error(errorMessage, 'Error');
        }
      );
    }
  }

  resendCodeWhatsapp() {
    this.showSpinner();
    const number_to_send = this.personalDataForm.get('telefono')?.value;
    this.mensageservice_.enviarTokenWasthapp(number_to_send).subscribe({
      next: (response) => {
        this.tokenRespuesta = response.token;
        this.hideSpinner();
        this.personalDataForm.get('otpCode')?.reset();
        this.displayWhatsappModal = true;
      },
      error: () => {
        this.errorMessage = 'No se pudo enviar el código. Por favor, intente nuevamente.';
      },
    });
  }

  resendCodeGmail() {
    this.showSpinner();
    const email = this.personalDataForm.get('email')?.value;

    this.mensageservice_.enviarTokenCorreo(email).subscribe({
      next: (response) => {
        this.tokenRespuesta = response.token;
        this.hideSpinner();
        this.displayGmailModal = true;
      },
      error: () => {
        this.errorMessage = 'No se pudo enviar el código. Por favor, intente nuevamente.';
      },
    });
  }

  resendCodeByOtherMethod() {
    if (this.displayGmailModal) {
      this.displayGmailModal = false;
      // lógica para seleccionar método
    } else if (this.displayWhatsappModal) {
      this.displayWhatsappModal = false;
      // lógica para seleccionar método
    }
  }
}
